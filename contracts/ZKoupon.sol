// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@selfxyz/contracts/contracts/interfaces/IVcAndDiscloseCircuitVerifier.sol";
import "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV1.sol";

contract ZKoupon is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    string private constant _baseTokenURI = "https://zkoupon.vercel.app";
    
    // ZK verification related variables
    IVcAndDiscloseCircuitVerifier public verifier;
    IIdentityVerificationHubV1 public identityVerificationHub;
    mapping(uint256 => bool) private _nullifiers;

    struct CouponData {
        address customer;
        uint256 amount;
        uint256 eligibleValue;
        bool used;
        uint256 nullifier;  // Added for ZK proof tracking
    }

    mapping(uint256 => CouponData) private _couponData;

    // 添加年齡限制映射
    mapping(uint256 => uint256) public ageLimits;

    event CouponMinted(uint256 indexed tokenId, address indexed customer, uint256 amount, uint256 eligibleValue, uint256 ageLimit);
    event CouponUsed(uint256 indexed tokenId);
    event AgeLimitUpdated(uint256 indexed tokenId, uint256 ageLimit);

    error InvalidProof();
    error NullifierAlreadyUsed();
    error AgeNotEligible();

    constructor(
        address _verifier,
        address _identityVerificationHub
    ) ERC721("ZKoupon", "ZKP") Ownable() {
        verifier = IVcAndDiscloseCircuitVerifier(_verifier);
        identityVerificationHub = IIdentityVerificationHubV1(_identityVerificationHub);
    }

    function mintCoupon(
        address customer,
        uint256 amount,
        uint256 eligibleValue,
        uint256 ageLimit,  // 添加年齡限制參數
        IVcAndDiscloseCircuitVerifier.VcAndDiscloseProof memory proof
    ) public onlyOwner returns (uint256) {
        if (_nullifiers[proof.pubSignals[0]]) {
            revert NullifierAlreadyUsed();
        }

        bool isValid = verifier.verifyProof(
            proof.a,
            proof.b,
            proof.c,
            proof.pubSignals
        );

        if (!isValid) {
            revert InvalidProof();
        }

        // 驗證年齡
        if (proof.pubSignals[1] < ageLimit) {  // pubSignals[1] 是年齡
            revert AgeNotEligible();
        }

        _nullifiers[proof.pubSignals[0]] = true;
        uint256 tokenId = _nextTokenId++;
        _safeMint(customer, tokenId);

        // Store coupon data with nullifier
        _couponData[tokenId] = CouponData({
            customer: customer,
            amount: amount,
            eligibleValue: eligibleValue,
            used: false,
            nullifier: proof.pubSignals[0]
        });

        ageLimits[tokenId] = ageLimit;  // 存儲年齡限制

        // Set token URI to metadata.json
        _setTokenURI(tokenId, "/metadata.json");

        emit CouponMinted(tokenId, customer, amount, eligibleValue, ageLimit);
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

    function setAgeLimit(uint256 tokenId, uint256 ageLimit) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        ageLimits[tokenId] = ageLimit;
        emit AgeLimitUpdated(tokenId, ageLimit);
    }
} 