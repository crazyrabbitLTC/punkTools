import { ethereum, Address, log, BigInt } from "@graphprotocol/graph-ts"

import { Transaction } from "../../generated/schema"
import { getAccount } from "./getAccount"
import { ADDRESS_ZERO } from "./CONSTS"

export function logTransaction(event: ethereum.Event): Transaction {

    let tx = new Transaction(event.transaction.hash.toHexString());

    let from = getAccount(event.transaction.from);
    from.interactionCount = from.interactionCount.plus(BigInt.fromI32(1))
    from.save()

    tx.from = from.id;
    tx.value = event.transaction.value;
    tx.gasUsed = event.transaction.gasUsed;
    tx.gasPrice = event.transaction.gasPrice;
    tx.timestamp = event.block.timestamp;
    tx.blockNumber = event.block.number;


    let toAccountAddress = Address.fromString(ADDRESS_ZERO)    //Check if the "To Address is Null"

    if (event.transaction.to == null) {

        tx.to = getAccount(toAccountAddress).id

    } else {

        tx.to = getAccount(event.transaction.to as Address).id

    }


    tx.save()

    return tx as Transaction;
}