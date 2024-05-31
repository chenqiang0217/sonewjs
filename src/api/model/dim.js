class Dim {
    static X = 0b00000100
    static Y = 0b00000010
    static Z = 0b00000001
    static NONE = 0b00000000
    static get XY(){
        return Dim.X | Dim.Y
    }
    static get XZ(){
        return Dim.X | Dim.Z
    }
    static get YZ(){
        return Dim.Y | Dim.Z
    }
    static get XYZ(){
        return Dim.X | Dim.Y | Dim.Z
    }
}
export { Dim }