// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "./interface/IERC20Mock.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Investment is Ownable {
    struct InitialRate {
        uint8 daysReturn;
        uint16 percent;
    }
    struct BalaceDevolution {
        address owner;
        uint256 balance;
        uint256 timestamp;
        uint8 percentRevenue;
        uint8 yieldRate;
    }
    IERC20Mock USDTContact;
    IERC20Mock VSIONContact;
    uint256 currentTokenId;

    InitialRate[2] public INITIAL_RATES;

    mapping(uint => BalaceDevolution) public balancesDevolution;

    event Withdrawal(uint amount, uint when);

    constructor(address USDT, address VSION) {
        USDTContact = IERC20Mock(USDT);
        VSIONContact = IERC20Mock(VSION);
        INITIAL_RATES[0] = InitialRate(45, 1800);
        INITIAL_RATES[1] = InitialRate(180, 4800);
    }

    /**
     * Permite invertir usdt enviando la candidad y el tipo de rendimineto
     */
    function investment(uint256 _value, uint8 _yieldRate) public {
        require(_yieldRate < 2, "This option don't exist.");

        USDTContact.transferFrom(msg.sender, address(this), _value);
        BalaceDevolution memory newBalanceUser = BalaceDevolution(
            msg.sender,
            _value,
            block.timestamp,
            0,
            _yieldRate
        );
        currentTokenId++;
        balancesDevolution[currentTokenId] = newBalanceUser;
    }

    function boostPercentRevenue(
        uint8 _boost,
        uint256 _tokenId
    ) public onlyOwner {
        uint256 _balance = VSIONContact.balanceOf(msg.sender);
        require(_balance > 0, "You should have VSION");

        uint8 currentPercent = balancesDevolution[_tokenId].percentRevenue;
        uint8 newPercent = currentPercent + _boost;

        require(10_000 < newPercent, "Percent must not greater than 100%");
        balancesDevolution[_tokenId].percentRevenue += _boost;
    }

    function withdraw(uint token) public {
        BalaceDevolution memory balanceUser = balancesDevolution[token];
        InitialRate memory _initialRate = INITIAL_RATES[balanceUser.yieldRate];
        require(balanceUser.owner == msg.sender, "it is not your token");
        require(
            block.timestamp - balanceUser.timestamp >=
                _initialRate.daysReturn * 1 days,
            "You can't withdraw yet"
        );

        emit Withdrawal(address(this).balance, block.timestamp);
        uint total = (balanceUser.balance *
            (_initialRate.percent + balanceUser.percentRevenue)) / 10000;
        console.log(total);
        USDTContact.transfer(msg.sender, total);
    }
}
