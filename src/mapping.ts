import { BigInt } from "@graphprotocol/graph-ts"
import {
  Assign,
  PunkTransfer,
  PunkOffered,
  PunkBidEntered,
  PunkBidWithdrawn,
  PunkBought,
  PunkNoLongerForSale
} from "../generated/Contract/Contract"
import { Punk, Account, Assign as AssignEntity, PunkTransfer as PTE, PunkOffered as PO, PunkBidEntered as PBE, PunkBidWithdrawn as PBW, PunkBought as PB, PunkNoLongerForSale as PNLFS } from "../generated/schema"
import { getAccount } from "./utils/getAccount"
import { getPunk } from "./utils/getPunk"
import { logTransaction } from "./utils/logTransaction"

export function handleAssign(event: Assign): void {
  let tx = logTransaction(event)

  let recipient = getAccount(event.params.to)
  recipient.totalPunks = recipient.totalPunks.plus(BigInt.fromI32(1))

  let punk = getPunk(event.params.punkIndex)
  punk.owner = recipient.id

  //This counts previous owners again
  punk.totalOwners = punk.totalOwners.plus(BigInt.fromI32(1))

  let ass = new AssignEntity(tx.id.concat(`-assign`))
  ass.transaction = tx.id
  ass.to = recipient.id
  ass.punkIndex = punk.id

  recipient.save()
  punk.save()

}

// export function handleTransfer(event: Transfer): void { }

export function handlePunkTransfer(event: PunkTransfer): void {
  let tx = logTransaction(event)

  let hpt = new PTE(tx.id.concat(`-punkTransfer`))
  hpt.transaction = tx.id

  let from = getAccount(event.params.from)
  let to = getAccount(event.params.to)
  let punk = getPunk(event.params.punkIndex)
  punk.forSale = false

  hpt.from = from.id
  hpt.to = to.id
  hpt.punkIndex = punk.id

  from.totalPunks = from.totalPunks.minus(BigInt.fromI32(1))
  to.totalPunks = to.totalPunks.plus(BigInt.fromI32(1))

  punk.totalOwners = punk.totalOwners.plus(BigInt.fromI32(1))
  punk.owner = to.id

  from.save()
  to.save()
  punk.save()
}

export function handlePunkOffered(event: PunkOffered): void {
  let tx = logTransaction(event)

  let punk = getPunk(event.params.punkIndex)
  punk.forSale = true

  let amount = event.params.minValue

  let to = getAccount(event.params.toAddress)
  to.totalOffered = to.totalOffered.plus(amount)

  let punkOffered = new PO(tx.id.concat(`-punkOffered`))
  punkOffered.transaction = tx.id
  punkOffered.punkIndex = punk.id
  punkOffered.minValue = amount
  punkOffered.toAddress = to.id

  punk.save()
  to.save()

}

export function handlePunkBidEntered(event: PunkBidEntered): void {
  let tx = logTransaction(event)

  let amount = event.params.value

  let punk = getPunk(event.params.punkIndex)
  punk.hasBid = true

  let bidder = getAccount(event.params.fromAddress)
  bidder.openBidCount = bidder.openBidCount.plus(BigInt.fromI32(1))


  //new event thing
  let pde = new PBE(punk.id.concat(`-`).concat(bidder.id).concat(`-punkBidEntered`))
  pde.transaction = tx.id
  pde.punkIndex = punk.id
  pde.value = amount
  pde.bidder = bidder.id

  let punkHighestBid = punk.highestBid
  if (amount.gt(punkHighestBid)) {
    punk.highestBid = amount
  }

  let bidderHighestBid = bidder.highestBid
  if (amount.gt(bidderHighestBid)) {
    bidder.highestBid = amount
  }

  pde.save()
  bidder.save()
  punk.save()
}

export function handlePunkBidWithdrawn(event: PunkBidWithdrawn): void {
  let tx = logTransaction(event)

  let punk = getPunk(event.params.punkIndex)
  punk.hasBid = false

  let value = event.params.value

  let bidder = getAccount(event.params.fromAddress)
  bidder.openBidCount = bidder.openBidCount.minus(BigInt.fromI32(1))

  let pbw = new PBW(tx.id.concat(`-punkBidWithdraw`))
  pbw.transaction = tx.id
  pbw.punkIndex = punk.id
  pbw.value = value
  pbw.bidder = bidder.id

  punk.save()
  bidder.save()
  pbw.save()

}

export function handlePunkBought(event: PunkBought): void {
  let tx = logTransaction(event)

  let punk = getPunk(event.params.punkIndex)
  let value = event.params.value
  let from = getAccount(event.params.fromAddress)
  let to = getAccount(event.params.toAddress)

  let pb = new PB(tx.id.concat(`-punkBought`))
  pb.transaction = tx.id
  pb.punkIndex = punk.id
  pb.value = value
  pb.from = from.id
  pb.to = to.id

  //If this is the highest price the punk sold for
  let highestPunkPrice = punk.highestPrice
  if (value.gt(highestPunkPrice)) {
    punk.highestPrice = value
  }

  //If this is the highest price that the account paid
  let highestPricePaid = to.highestPricePaid
  if (value.gt(highestPricePaid)) {
    to.highestPricePaid = value
  }

  //Increement the punks Total Owners
  punk.totalOwners = punk.totalOwners.plus(BigInt.fromI32(1))

  //Set the new punk owner
  punk.owner = to.id
  punk.forSale = false

  to.totalPunks = to.totalPunks.plus(BigInt.fromI32(1))
  from.totalPunks = from.totalPunks.minus(BigInt.fromI32(1))

  to.totalSpentBuyingPunks = to.totalSpentBuyingPunks.plus(value)
  from.totalEarnedSellingPunks = from.totalEarnedSellingPunks.plus(value)

  to.totalPunks = to.totalPunks.plus(BigInt.fromI32(1))
  from.totalPunks = from.totalPunks.minus(BigInt.fromI32(1))

  //Is there an open bid for this punk from the To? 
  let openBid = PBE.load(punk.id.concat(`-`).concat(to.id).concat(`-punkBidEntered`))
  if (openBid != null) {
    to.openBidCount = to.openBidCount.minus(BigInt.fromI32(1))
  }

  punk.save()
  from.save()
  to.save()
  pb.save()

}

export function handlePunkNoLongerForSale(event: PunkNoLongerForSale): void {
  let tx = logTransaction(event)

  let punkNoLongerForSale = new PNLFS(tx.id.concat(`-punkNoLongerForSale`))
  punkNoLongerForSale.transaction = tx.id

  let punk = getPunk(event.params.punkIndex)
  punk.forSale = false
  punkNoLongerForSale.punkIndex = punk.id

  punk.save()

}

export function handleTransfer(): void {}