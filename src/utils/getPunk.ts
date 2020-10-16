import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Punk } from "../../generated/schema"


export function getPunk(punkIndex: BigInt): Punk {

    let punk = Punk.load(punkIndex.toString())
    
    if (punk == null) {
        punk.totalOwners = BigInt.fromI32(0)
        punk.highestPrice = BigInt.fromI32(0)
        punk.highestBid = BigInt.fromI32(0)
        punk.hasBid = false
        punk.forSale = false
    }


    return punk as Punk
}
