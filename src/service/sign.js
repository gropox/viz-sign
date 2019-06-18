const viz = require("viz-js-lib");

export const SIGN_TYPE = {
    PASSWORD: "password",
    WIF: "wif",
}

/**
 * Подпись и отправка транзакции. Имплементация взята из golos-js.broadcast.send и адаптирована под свои нужды.
 * @param {operation/Transaction} transaction 
 * @param {SIGN_TYPE} sign_type 
 * @param {string} account 
 * @param {string} password 
 * @returns "Возвращает данные о созданной транзакции"
 */
async function signandsend(transaction, sign_type, account, password) {
    const {raw_transaction, required_wif} = transaction;

    //Получаем ключ из аккаунта и пароля, если передан пароль
    const wif = getWif(sign_type, account, password, required_wif);

    //Формируем объект транзакции и объект с ключем
    const tx = {extensions: [], operations: raw_transaction}; 
    const key = {[required_wif]: wif};

    //Подготавливаем транзакцию используя метод библиотеки. Получаем блок референсный блок, выставляем expiration.
    const prepared_tx = await viz.broadcast._prepareTransaction(tx);
    
    //Подписываем транзакцию ключем
    const signed_tx = viz.auth.signTransaction(prepared_tx, key);

    //Отправляем транзакцию ноде и в ответ получаем ID транзакции и блок.
    let ret = await viz.api.broadcastTransactionSynchronousAsync(signed_tx);
    return ret;
}

/**
 * Генерирует из имени аккаунта и мастер-пароля ключ нужного уровня доступа. 
 * Или возвращает пароль как есть, в надежде, что это приватный ключ.
 * @param {SIGN_TYPE} sign_type - Тип подписи. Аккаунт + пароль или приыватный ключ.
 * @param {string} account - Аккаунт голос
 * @param {string} password - Пароль или приватный ключ
 * @param {string} required_wif - Требуемый уровень доступа - owner, active, posting или memo
 * @returns "Возвращает необходимый для подписи ключ."
 */
function getWif(sign_type, account, password, required_wif) {
    switch(sign_type) {
        case SIGN_TYPE.PASSWORD:
            const wifs = viz.auth.getPrivateKeys(account, password, [required_wif]);
            return wifs[required_wif];
        default:
            return password;
    }
}

/**
 * Проверяет, существует ли аккаунт с таким именем. Для этого пробует загрузить данные аккаунта.
 * @param {string} account 
 * @returns Возвращет текст с сообщением об ошибке.
 */
export async function checkAccount(account) {
    if(!account) {
        return "Аккаунт обязателен для аутентификации паролем";
    }
    const [acc] = await viz.api.getAccountsAsync([account]);
    if(!acc) {
        return "Аккаунт с таким именем не существует!";
    }
    return null;
}

export default signandsend;