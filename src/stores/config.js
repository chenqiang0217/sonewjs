import { defineStore } from 'pinia'

const useConfigStore = defineStore('config', {
    state: () => {
        return {
            project: {
                name: ``,
                date: ``,
                description: '',
            },
            ui: {
                theme: '',
                font: ``,
                sizePx: 12,
            },
            task: {
                loadStep: [
                    {
                        no: 1,
                        name: 'basis',
                        categorization: 'basis',
                        nSubStep: 7,
                        description: 'basis',
                        subStep: [
                            {
                                no: 1,
                                nIterativeStep: 10,
                                alpha: 1.0e2,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 2,
                                nIterativeStep: 20,
                                alpha: 1.0e1,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 3,
                                nIterativeStep: 20,
                                alpha: 1.0e0,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 4,
                                nIterativeStep: 20,
                                alpha: 1.0e-1,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 5,
                                nIterativeStep: 50,
                                alpha: 1.0e-3,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 6,
                                nIterativeStep: 50,
                                alpha: 1.0e-5,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 7,
                                nIterativeStep: 50,
                                alpha: 0,
                                rsdl: 1.0e-6,
                            },
                        ],
                    },
                ],
                result: {
                    query: {
                        count: 50,
                        delaySecond: 2,
                        timeoutSecond: 5,
                        retry: 100000,
                    }
                }
            }
        }
    },
    actions: {
    },
})


export { useConfigStore }