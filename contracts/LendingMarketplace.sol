// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract LendingMarketplace is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Loan {
        uint256 loanId;
        address borrower;
        address lender;
        address collateralAsset;
        address loanAsset;
        uint256 collateralAmount;
        uint256 loanAmount;
        uint256 interestRate; // Annual interest rate in basis points (e.g., 500 = 5%)
        uint256 duration; // Duration in days
        uint256 startTime;
        uint256 liquidationThreshold; // LTV threshold in basis points (e.g., 15000 = 150%)
        LoanStatus status;
        uint256 lastInterestPayment;
        uint256 totalInterestPaid;
    }

    enum LoanStatus {
        Pending,      // Waiting for lender
        Active,       // Loan is active
        Repaid,       // Loan fully repaid
        Liquidated,   // Collateral liquidated
        Defaulted     // Loan defaulted
    }

    struct LoanOffer {
        uint256 offerId;
        address lender;
        address loanAsset;
        uint256 loanAmount;
        uint256 interestRate;
        uint256 duration;
        uint256 minCollateralRatio; // Minimum collateral ratio required
        bool isActive;
        uint256 createdAt;
    }

    mapping(uint256 => Loan) public loans;
    mapping(uint256 => LoanOffer) public loanOffers;
    mapping(address => uint256[]) public userLoans;
    mapping(address => uint256[]) public userOffers;

    uint256 public loanCounter;
    uint256 public offerCounter;
    uint256 public platformFee = 25; // 0.25% in basis points
    uint256 public liquidationBonus = 500; // 5% bonus for liquidators

    // Oracle address for price feeds (would be Chainlink in production)
    address public priceOracle;

    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanOffered(uint256 indexed offerId, address indexed lender, uint256 amount);
    event LoanFunded(uint256 indexed loanId, address indexed lender);
    event LoanRepaid(uint256 indexed loanId, uint256 amount);
    event LoanLiquidated(uint256 indexed loanId, address indexed liquidator);
    event CollateralWithdrawn(uint256 indexed loanId, uint256 amount);

    constructor(address _priceOracle) {
        priceOracle = _priceOracle;
    }

    function requestLoan(
        address _collateralAsset,
        address _loanAsset,
        uint256 _collateralAmount,
        uint256 _loanAmount,
        uint256 _interestRate,
        uint256 _duration,
        uint256 _liquidationThreshold
    ) external nonReentrant {
        require(_collateralAmount > 0, "Collateral amount must be greater than 0");
        require(_loanAmount > 0, "Loan amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(_liquidationThreshold >= 12000, "Liquidation threshold too low"); // Min 120%

        // Transfer collateral to contract
        IERC20(_collateralAsset).safeTransferFrom(msg.sender, address(this), _collateralAmount);

        loanCounter++;
        uint256 loanId = loanCounter;

        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            lender: address(0),
            collateralAsset: _collateralAsset,
            loanAsset: _loanAsset,
            collateralAmount: _collateralAmount,
            loanAmount: _loanAmount,
            interestRate: _interestRate,
            duration: _duration,
            startTime: 0, // Set when funded
            liquidationThreshold: _liquidationThreshold,
            status: LoanStatus.Pending,
            lastInterestPayment: 0,
            totalInterestPaid: 0
        });

        userLoans[msg.sender].push(loanId);

        emit LoanRequested(loanId, msg.sender, _loanAmount);
    }

    function offerLoan(
        address _loanAsset,
        uint256 _loanAmount,
        uint256 _interestRate,
        uint256 _duration,
        uint256 _minCollateralRatio
    ) external nonReentrant {
        require(_loanAmount > 0, "Loan amount must be greater than 0");

        // Transfer loan amount to contract
        IERC20(_loanAsset).safeTransferFrom(msg.sender, address(this), _loanAmount);

        offerCounter++;
        uint256 offerId = offerCounter;

        loanOffers[offerId] = LoanOffer({
            offerId: offerId,
            lender: msg.sender,
            loanAsset: _loanAsset,
            loanAmount: _loanAmount,
            interestRate: _interestRate,
            duration: _duration,
            minCollateralRatio: _minCollateralRatio,
            isActive: true,
            createdAt: block.timestamp
        });

        userOffers[msg.sender].push(offerId);

        emit LoanOffered(offerId, msg.sender, _loanAmount);
    }

    function fundLoan(uint256 _loanId, uint256 _offerId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        LoanOffer storage offer = loanOffers[_offerId];

        require(loan.status == LoanStatus.Pending, "Loan is not pending");
        require(offer.isActive, "Offer is not active");
        require(offer.lender == msg.sender, "Only offer creator can fund");
        require(offer.loanAsset == loan.loanAsset, "Asset mismatch");
        require(offer.loanAmount >= loan.loanAmount, "Offer amount too low");

        // Check collateral ratio
        uint256 collateralValue = getAssetValue(loan.collateralAsset, loan.collateralAmount);
        uint256 loanValue = getAssetValue(loan.loanAsset, loan.loanAmount);
        uint256 collateralRatio = (collateralValue * 10000) / loanValue;

        require(collateralRatio >= offer.minCollateralRatio, "Insufficient collateral");

        // Update loan
        loan.lender = msg.sender;
        loan.interestRate = offer.interestRate;
        loan.duration = offer.duration;
        loan.startTime = block.timestamp;
        loan.lastInterestPayment = block.timestamp;
        loan.status = LoanStatus.Active;

        // Update offer
        offer.isActive = false;

        // Transfer loan amount to borrower
        IERC20(loan.loanAsset).safeTransfer(loan.borrower, loan.loanAmount);

        emit LoanFunded(_loanId, msg.sender);
    }

    function repayLoan(uint256 _loanId, uint256 _repaymentAmount) external nonReentrant {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.Active, "Loan is not active");
        require(msg.sender == loan.borrower, "Only borrower can repay");

        uint256 interestDue = calculateInterestDue(_loanId);
        uint256 totalDue = loan.loanAmount + interestDue;
        require(_repaymentAmount >= totalDue, "Insufficient repayment amount");

        // Update loan status
        loan.status = LoanStatus.Repaid;
        loan.totalInterestPaid = interestDue;

        // Calculate platform fee
        uint256 fee = (interestDue * platformFee) / 10000;
        uint256 lenderAmount = interestDue - fee;

        // Transfer repayment to lender
        IERC20(loan.loanAsset).safeTransfer(loan.lender, loan.loanAmount + lenderAmount);

        // Transfer fee to owner
        if (fee > 0) {
            IERC20(loan.loanAsset).safeTransfer(owner(), fee);
        }

        // Return remaining collateral to borrower
        IERC20(loan.collateralAsset).safeTransfer(loan.borrower, loan.collateralAmount);

        emit LoanRepaid(_loanId, _repaymentAmount);
    }

    function liquidateLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.Active, "Loan is not active");
        require(isLiquidatable(_loanId), "Loan is not liquidatable");

        loan.status = LoanStatus.Liquidated;

        // Calculate liquidation amount with bonus
        uint256 collateralValue = getAssetValue(loan.collateralAsset, loan.collateralAmount);
        uint256 bonus = (collateralValue * liquidationBonus) / 10000;
        uint256 totalLiquidationAmount = collateralValue + bonus;

        // Transfer collateral to liquidator
        IERC20(loan.collateralAsset).safeTransfer(msg.sender, loan.collateralAmount);

        // Transfer loan amount back to lender
        uint256 remainingLoan = loan.loanAmount - calculateInterestDue(_loanId);
        if (remainingLoan > 0) {
            IERC20(loan.loanAsset).safeTransfer(loan.lender, remainingLoan);
        }

        emit LoanLiquidated(_loanId, msg.sender);
    }

    function calculateInterestDue(uint256 _loanId) public view returns (uint256) {
        Loan memory loan = loans[_loanId];

        if (loan.status != LoanStatus.Active) return 0;

        uint256 timeElapsed = block.timestamp - loan.lastInterestPayment;
        uint256 annualInterest = (loan.loanAmount * loan.interestRate) / 10000;
        uint256 dailyInterest = annualInterest / 365;

        return (dailyInterest * timeElapsed) / 86400; // Convert to seconds
    }

    function isLiquidatable(uint256 _loanId) public view returns (bool) {
        Loan memory loan = loans[_loanId];

        if (loan.status != LoanStatus.Active) return false;

        uint256 collateralValue = getAssetValue(loan.collateralAsset, loan.collateralAmount);
        uint256 loanValue = getAssetValue(loan.loanAsset, loan.loanAmount + calculateInterestDue(_loanId));

        uint256 currentRatio = (collateralValue * 10000) / loanValue;

        return currentRatio < loan.liquidationThreshold;
    }

    function getAssetValue(address _asset, uint256 _amount) public view returns (uint256) {
        // In production, this would query a price oracle
        // For now, return amount as-is (assuming 1:1 value)
        return _amount;
    }

    // View functions
    function getLoan(uint256 _loanId) external view returns (Loan memory) {
        return loans[_loanId];
    }

    function getLoanOffer(uint256 _offerId) external view returns (LoanOffer memory) {
        return loanOffers[_offerId];
    }

    function getUserLoans(address _user) external view returns (uint256[] memory) {
        return userLoans[_user];
    }

    function getUserOffers(address _user) external view returns (uint256[] memory) {
        return userOffers[_user];
    }

    function getActiveLoanOffers() external view returns (uint256[] memory) {
        uint256[] memory activeOffers = new uint256[](offerCounter);
        uint256 count = 0;

        for (uint256 i = 1; i <= offerCounter; i++) {
            if (loanOffers[i].isActive) {
                activeOffers[count] = i;
                count++;
            }
        }

        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeOffers[i];
        }

        return result;
    }

    // Admin functions
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%"); // Max 10% in basis points
        platformFee = _fee;
    }

    function setLiquidationBonus(uint256 _bonus) external onlyOwner {
        require(_bonus <= 1000, "Bonus cannot exceed 10%"); // Max 10%
        liquidationBonus = _bonus;
    }

    function setPriceOracle(address _oracle) external onlyOwner {
        priceOracle = _oracle;
    }

    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}

