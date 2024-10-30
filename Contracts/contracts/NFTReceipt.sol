// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTReceipt is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    string public baseUri="ipfs://";

    constructor() ERC721("Zarpay", "ZPAY") Ownable(msg.sender) {}

    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    function setBaseURI(string memory newUri) public onlyOwner{
        baseUri=newUri;
    }

    function safeMint(address to, string memory uri) public /*onlyOwner*/ {
        uint256 tokenId = _tokenIdCounter;        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _tokenIdCounter++;
    }

    function currentTokenCounter() view public returns (uint){
        return _tokenIdCounter;
    }

    // The following functions are overrides required by Solidity.

    // function _burn(uint256 tokenId) internal override(ERC721) {
    //     super._burn(tokenId);
    // }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
		return super.supportsInterface(interfaceId);
	}
}