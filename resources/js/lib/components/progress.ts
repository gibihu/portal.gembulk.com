export class ProgressHelper{
    static calculate(value: number, max?: number){
        return Math.min(100,Math.max(0, ((value ?? 0) / (max ?? 1)) * 100))
    }
}