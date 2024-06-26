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
                                nIterativeStep: 20,
                                alpha: 1.0e2,
                                rsdl: 1.0e-5,
                            },
                            {
                                no: 2,
                                nIterativeStep: 30,
                                alpha: 1.0e1,
                                rsdl: 1.0e-5,
                            },
                            {
                                no: 3,
                                nIterativeStep: 30,
                                alpha: 1.0e0,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 4,
                                nIterativeStep: 30,
                                alpha: 1.0e-1,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 5,
                                nIterativeStep: 60,
                                alpha: 1.0e-3,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 6,
                                nIterativeStep: 60,
                                alpha: 1.0e-5,
                                rsdl: 1.0e-6,
                            },
                            {
                                no: 7,
                                nIterativeStep: 60,
                                alpha: 0,
                                rsdl: 1.0e-6,
                            },
                        ],
                    },
                    {
                        no: 2,
                        name: 'test',
                        categorization: 'test',
                        nSubStep: 2,
                        description: 'test',
                        subStep: [
                            {
                                no: 1,
                                nIterativeStep: 20,
                                alpha: 1.0e2,
                                rsdl: 1.0e-5,
                            },
                            {
                                no: 2,
                                nIterativeStep: 30,
                                alpha: 1.0e1,
                                rsdl: 1.0e-5,
                            }
                        ],
                    },
                ],
                result: {
                    query: {
                        count: 50,
                        delaySecond: 5,
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