import { Address, BigInt } from "@graphprotocol/graph-ts"
import { Account } from "../../generated/schema"
import { ADDRESS_ZERO } from "./CONSTS"



export function getAccount(address: Address): Account {

    let account = Account.load(address.toHexString())
    
    if (account == null) {
        account = new Account(address.toHexString())
        account.totalEarnedSellingPunks = BigInt.fromI32(0)
        account.totalSpentBuyingPunks = BigInt.fromI32(0)
        account.totalPunks = BigInt.fromI32(0)
        account.interactionCount = BigInt.fromI32(1)
        account.highestBid = BigInt.fromI32(0)
        account.highestPricePaid = BigInt.fromI32(0)
        account.openBidCount = BigInt.fromI32(0)
        account.save()
    }


    return account as Account
}
