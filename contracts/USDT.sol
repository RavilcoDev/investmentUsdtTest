// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDT is ERC20 {
    constructor() ERC20("USDT", "USDT Stablecoin") {
        _mint(msg.sender, 1000000);
        //TODO : cambiar a 2 decimas
    }
}
