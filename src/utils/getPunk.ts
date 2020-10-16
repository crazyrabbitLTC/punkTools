import { BigInt } from "@graphprotocol/graph-ts"
import { Punk } from "../../generated/schema"


export function getPunk(punkIndex: BigInt): Punk {

    let punk = Punk.load(punkIndex.toString())
    
    if (punk == null) {
        punk = new Punk(punkIndex.toString())
        punk.totalOwners = BigInt.fromI32(1)
        punk.highestPrice = BigInt.fromI32(0)
        punk.highestBid = BigInt.fromI32(0)
        punk.hasBid = false
        punk.forSale = false
    }


    return punk as Punk
}
