// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZKoupon is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    string private constant _baseTokenURI = "https://zkoupon.vercel.app";

    struct CouponData {
        address customer;
        uint256 amount;
        uint256 eligibleValue;
        bool used;
    }

    mapping(uint256 => CouponData) private _couponData;

    event CouponMinted(uint256 indexed tokenId, address indexed customer, uint256 amount, uint256 eligibleValue);
    event CouponUsed(uint256 indexed tokenId);

    constructor() ERC721("ZKoupon", "ZKP") Ownable() {}

    function mintCoupon(
        address customer,
        uint256 amount,
        uint256 eligibleValue
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(customer, tokenId);

        // Store coupon data
        _couponData[tokenId] = CouponData({
            customer: customer,
            amount: amount,
            eligibleValue: eligibleValue,
            used: false
        });

        // Set token URI to metadata.json
        _setTokenURI(tokenId, "/metadata.json");

        emit CouponMinted(tokenId, customer, amount, eligibleValue);
        return tokenId;
    }

    function useCoupon(uint256 tokenId) public {
        require(_exists(tokenId), "Coupon does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the coupon owner");
        require(!_couponData[tokenId].used, "Coupon already used");

        _couponData[tokenId].used = true;
        emit CouponUsed(tokenId);
    }

    function getCouponData(uint256 tokenId) public view returns (
        address customer,
        uint256 amount,
        uint256 eligibleValue,
        bool used
    ) {
        require(_exists(tokenId), "Coupon does not exist");
        CouponData memory data = _couponData[tokenId];
        return (data.customer, data.amount, data.eligibleValue, data.used);
    }

    function _baseURI() internal pure override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _exists(uint256 tokenId) internal view override returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
} 