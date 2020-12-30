import React from 'react'
import {Text, View, Image} from 'react-native'
import MaskedView from '@react-native-community/masked-view'
import ViewShot from 'react-native-view-shot'
import jigsaw from '../../assets/img'

class SliceTo36 extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      pieces: [
        {id: 0, left: 0, top: 0, right: 1, bottom: 1},
        {id: 1, left: 0, top: 0, right: 0, bottom: 1},
        {id: 2, left: 1, top: 0, right: 1, bottom: 0},
        {id: 3, left: 0, top: 0, right: 0, bottom: 1},
        {id: 4, left: 1, top: 0, right: 0, bottom: 0},
        {id: 5, left: 1, top: 0, right: 0, bottom: 1},
        {id: 6, left: 0, top: 0, right: 1, bottom: 0},
        {id: 7, left: 0, top: 0, right: 0, bottom: 0},
        {id: 8, left: 1, top: 1, right: 0, bottom: 1},
        {id: 9, left: 1, top: 0, right: 0, bottom: 0},
        {id: 10, left: 1, top: 1, right: 0, bottom: 0},
        {id: 11, left: 1, top: 0, right: 0, bottom: 0},
        {id: 12, left: 0, top: 1, right: 0, bottom: 0},
        {id: 13, left: 1, top: 1, right: 0, bottom: 0},
        {id: 14, left: 1, top: 0, right: 0, bottom: 1},
        {id: 15, left: 1, top: 1, right: 1, bottom: 1},
        {id: 16, left: 0, top: 1, right: 0, bottom: 0},
        {id: 17, left: 1, top: 1, right: 0, bottom: 0},
        {id: 18, left: 0, top: 1, right: 1, bottom: 1},
        {id: 19, left: 0, top: 1, right: 1, bottom: 1},
        {id: 20, left: 0, top: 0, right: 1, bottom: 0},
        {id: 21, left: 0, top: 0, right: 0, bottom: 1},
        {id: 22, left: 1, top: 1, right: 0, bottom: 0},
        {id: 23, left: 1, top: 1, right: 0, bottom: 1},
        {id: 24, left: 0, top: 0, right: 1, bottom: 1},
        {id: 25, left: 0, top: 0, right: 0, bottom: 0},
        {id: 26, left: 1, top: 1, right: 1, bottom: 1},
        {id: 27, left: 0, top: 0, right: 0, bottom: 0},
        {id: 28, left: 1, top: 1, right: 1, bottom: 0},
        {id: 29, left: 0, top: 0, right: 0, bottom: 0},
        {id: 30, left: 0, top: 0, right: 1, bottom: 0},
        {id: 31, left: 0, top: 1, right: 0, bottom: 0},
        {id: 32, left: 1, top: 0, right: 1, bottom: 0},
        {id: 33, left: 0, top: 1, right: 0, bottom: 0},
        {id: 34, left: 1, top: 1, right: 0, bottom: 0},
        {id: 35, left: 1, top: 1, right: 0, bottom: 0},
      ],
      shufflePieces: [],
      pieceSize: 80,
      bulgeSize: 22,
      row: 6,
    }
  }

  generateCoord = () => {
    let x = 0
    let y = 0
    let rusuk = 480 / 6
    this.state.pieces.map((item, key) => {
      this.setState({
        pieces: this.state.pieces.map((e) => {
          return item.id === e.id ? Object.assign(e, {x: x, y: y}) : e
        }),
      })
      x = x + rusuk
      if (x === rusuk * 6) {
        x = 0
        y = y + rusuk
      }
    })
  }

  UNSAFE_componentWillMount() {
    this.generateCoord()
  }

  handleJigsawPieces = () => {
    this.state.pieces.map((item) => {
      this['pcs' + item.id].capture().then((uri) => {
        this.setState({
          pieces: this.state.pieces.map((e) => {
            return item.id === e.id ? Object.assign(e, {pcsUrl: uri}) : e
          }),
        })
      })
    })
  }

  handleDropZonePieces = () => {
    this.state.pieces.map((item) => {
      this['zone' + item.id].capture().then((uri) => {
        this.setState({
          pieces: this.state.pieces.map((e) => {
            return item.id === e.id ? Object.assign(e, {zoneUrl: uri}) : e
          }),
        })
      })
    })
  }

  shufflePieces = () => {
    let newTilesArray = [...this.state.pieces]
    let length = this.state.pieces.length
    for (let i = 0; i < length; i++) {
      let random = Math.floor(Math.random() * (length - 1))
      let randomItemArray = newTilesArray.splice(random, 1)
      newTilesArray.push(randomItemArray[0])
    }
    this.setState({shufflePieces: newTilesArray})
  }

  componentDidMount() {
    this.handleJigsawPieces()
    this.handleDropZonePieces()
    this.shufflePieces()
    setTimeout(() => {
      this.props.navigation.navigate('Puzzle', {
        pieces: this.state.pieces,
        pieceSize: this.state.pieceSize,
        bulgeSize: this.state.bulgeSize,
        row: this.state.row,
        shufflePieces: this.state.shufflePieces,
      })
    }, 3000)
  }

  render() {
    return (
      <>
        {this.state.pieces.map((item, key) => (
          <ViewShot
            key={item.id}
            style={{
              width:
                this.state.pieceSize +
                this.state.bulgeSize * (item.left + item.right),
              height:
                this.state.pieceSize +
                this.state.bulgeSize * (item.top + item.bottom),
            }}
            ref={(ref) => (this['pcs' + item.id] = ref)}
            options={{format: 'png', quality: 0.9}}>
            <MaskedView
              maskElement={
                <Image
                  style={{
                    width:
                      this.state.pieceSize +
                      this.state.bulgeSize * (item.left + item.right),
                    height:
                      this.state.pieceSize +
                      this.state.bulgeSize * (item.top + item.bottom),
                  }}
                  source={jigsaw.pieces['to' + this.state.row]['pcs' + item.id]}
                />
              }>
              <Image
                style={{
                  width: 480,
                  height: 480,
                  left: -item.x + this.state.bulgeSize * item.left,
                  top: -item.y + this.state.bulgeSize * item.top,
                }}
                source={jigsaw.img}
              />
            </MaskedView>
          </ViewShot>
        ))}
        {this.state.pieces.map((item, key) => (
          <ViewShot
            key={item.id}
            style={{
              width:
                this.state.pieceSize +
                this.state.bulgeSize * (item.left + item.right),
              height:
                this.state.pieceSize +
                this.state.bulgeSize * (item.top + item.bottom),
            }}
            ref={(ref) => (this['zone' + item.id] = ref)}
            options={{format: 'png', quality: 0.9}}>
            <MaskedView
              maskElement={
                <Image
                  style={{
                    width:
                      this.state.pieceSize +
                      this.state.bulgeSize * (item.left + item.right),
                    height:
                      this.state.pieceSize +
                      this.state.bulgeSize * (item.top + item.bottom),
                  }}
                  source={
                    jigsaw.pieces['to' + this.state.row]['zone' + item.id]
                  }
                />
              }>
              <View
                style={{
                  width: 480,
                  height: 480,
                  backgroundColor: '#000',
                }}
              />
            </MaskedView>
          </ViewShot>
        ))}
      </>
    )
  }
}

export default SliceTo36
