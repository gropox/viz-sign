/*
* Схемы операций для валидирования.
*/

/**
 * Взято из исходников голоса
 */
const known_operations = [
    "vote",
    "content",
    "transfer",
    "transfer_to_vesting",
    "withdraw_vesting",
    "account_update",
    "witness_update",
    "account_witness_vote",
    "account_witness_proxy",
    "delete_content",
    "custom",
    "set_withdraw_vesting_route",
    "request_account_recovery",
    "recover_account",
    "change_recovery_account",
    "escrow_transfer",
    "escrow_dispute",
    "escrow_release",
    "escrow_approve",
    "delegate_vesting_shares",
    "account_create",
    "account_metadata",
    "proposal_create",
    "proposal_update",
    "proposal_delete",
    "chain_properties_update",
    "committee_worker_create_request",
    "committee_worker_cancel_request",
    "committee_vote_request",
    "committee_pay_request",
    "witness_reward",
    "create_invite",
    "claim_invite_balance",
    "invite_registration",
    "versioned_chain_properties_update",
    "award",
    "set_paid_subscription",
    "paid_subscribe",
    "set_account_price",
    "set_subaccount_price",
    "buy_account",  
]


/**
 * Схема параметра transaction. Ожидается массив (Array) операций
 */
const transaction = {
    "$id" : "/viz/transaction",
    type: "array",
    minItems: 1,
    items: [ 
        {"$ref": "/viz/operation"}
    ]
}

/**
 * Операция 
 */
const operation = {
    "$id" : "/viz/operation",
    type: "array",
    minItems: 2, maxLength: 2,
    items: [
        {type: "string", enum: known_operations},
        {type: "object"}
    ]
}


const account = {
    "$id" : "/viz/account",
    type: "string",
    pattern: "^[a-z][-\\.a-z\\d]{2,15}[a-z\\d]$"
}

const permlink = {
    "$id" : "/viz/permlink",
    type: "string",
    pattern: "^.{1,256}$"
}

const public_key = {
    "$id" : "/viz/public_key",
    type: "string",
    pattern: "^GLS[0-9a-zA-Z]{50}$"
}

const percent = {
    "$id" : "/viz/percent",
    type: "integer",
    minimum: 0, 
    maximum: 10000
}

const asset = {
    "$id" : "/viz/asset",
    type: "string",
    pattern: "^[0-9]+\\.[0-9]{3} (viz|GBG)$"
}

export default [
    //базовые типы
    transaction,
    account,
    asset,
    permlink,
    public_key,
    percent, 

    operation,
]

