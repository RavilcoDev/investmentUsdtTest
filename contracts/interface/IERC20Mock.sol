// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC20Mock is IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);

    // function transferFrom(
    //     address from,
    //     address to,
    //     uint256 amount
    // ) external returns (bool);

    // function transfer(address _to, uint256 _value) external returns (bool);
}
