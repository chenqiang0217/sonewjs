class Commander {
    constructor(code) {
        this.command = new Function(code)
    }
    execute() {
        let result
        try{
            result =  this.command()
        }
        catch(error){
            return 'error'
        }
        return '执行完成'
    }
}
export { Commander }