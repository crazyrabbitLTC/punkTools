import { Address, BigInt, log, ethereum, BigDecimal } from "@graphprotocol/graph-ts"
import { Account, Transaction, VotePower } from "../../generated/schema"
import { Token } from "../../generated/Token/Token"
import { ADDRESS_ZERO } from "../utils/CONSTS"



export function getAccount(address: Address): Account {

    let account = Account.load(address.toHexString())
    
    if (account == null) {
        account = new Account(address.toHexString())
        account.tokenBalance = BigInt.fromI32(0)
        account.isSetupToVote = false
        account.votes = BigInt.fromI32(0)
        account.delegatingTo = null
        account.isCrowdProposal = false
        account.ballotsCastCount = BigInt.fromI32(0)
        account.proposalsProposedCount = BigInt.fromI32(0)
        account.tokenTransferOutCount = BigInt.fromI32(0)
        account.tokenTransferInCount = BigInt.fromI32(0)
        account.interactionCount = BigInt.fromI32(1)
        account.freqInSupport = BigDecimal.fromString("0")
        account.freqAgainstSupport = BigDecimal.fromString("0")
        account.ballotsInSuppportCount = BigInt.fromI32(0)
        account.ballotsAgainstSupportCount = BigInt.fromI32(0)
        account.save()
    }


    return account as Account
}
