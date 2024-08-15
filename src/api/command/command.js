import {defineStore} from 'pinia'

class Command {
    execute() {}
    undo() {}
}
const useCommandStore = defineStore('command', {
    state: () => {
        return {
            commandQueue: [],
            currentStep: -1
        }
    },
    actions: {
        addCommand(command, remainNoExecuted = false) {
            if(!remainNoExecuted){
                this.commandQueue.splice(this.currentStep + 1)
            }
            this.commandQueue.push(command)
        },
        execute(steps = 1) {
            for (let i = 1; i <= steps; i++) {            
                if (this.currentStep + 1 < this.commandQueue.length) {
                    this.currentStep += 1
                    this.commandQueue[this.currentStep].execute()
                } else {
                    break
                }
            }
        },
        undo(steps = 1) {
            for (let i = 1; i <= steps; i++) {
                if (this.currentStep >= 0) {
                    this.commandQueue[this.currentStep].undo()
                    this.currentStep -= 1
                } else {
                    break
                }
            }
        }
    }
})

export {Command, useCommandStore}
