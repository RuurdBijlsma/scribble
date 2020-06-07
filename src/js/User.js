export default class User {
    constructor({id = '', name = '', stream = null, host = false, me = false, avatar = ''}) {
        this.id = id;
        this.name = name;
        this.stream = stream;
        this.host = host;
        this.me = me;
        this.avatar = '';
    }
}