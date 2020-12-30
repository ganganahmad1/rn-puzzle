import React from 'react'
import {
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  FlatList,
  View,
} from 'react-native'
import CameraRoll from '@react-native-community/cameraroll'
import ImageEditor from '@react-native-community/image-editor'

class Cropper extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      photo: {
        uri:
          'https://image.winudf.com/v2/image1/Y29tLmJlcnphbmFwcC5IRGR1dmFya2FnaWRpX3NjcmVlbl82XzE1NTA5NTU2NTVfMDgz/screen-6.jpg?fakeurl=1&type=.jpg',
        side: 480,
      },
      croppedImage: [],
      tilesArray: [],
      difficult: this.props.route.params.dif,
    }
  }

  componentDidMount() {
    this.generateTiles()
  }

  generateTiles = () => {
    let newTilesArray = []
    let rusuk = this.state.photo.side / Math.sqrt(this.state.difficult)
    let x = 0
    let y = 0
    let row = Math.sqrt(this.state.difficult) - 1
    for (let i = 0; i < this.state.difficult; i++) {
      let newTile = {id: i, x: x, y: y}
      newTilesArray.push(newTile)
      x = x + rusuk
      if (newTilesArray[newTilesArray.length - 1].x === rusuk * row) {
        x = 0
        y = y + rusuk
      }
    }
    this.setState({tilesArray: newTilesArray}, () => {
      this.cropImage()
    })
  }

  // shuffleTiles = () => {
  //   let newTilesArray = [...this.state.tilesArray]
  //   let length = this.state.tilesArray.length
  //   for (let i = 0; i < length; i++) {
  //     let random = Math.floor(Math.random() * (length - 1))
  //     let randomItemArray = newTilesArray.splice(random, 1)
  //     newTilesArray.push(randomItemArray[0])
  //   }

  //   this.setState({shuffleTiles: newTilesArray})
  // }

  cropImage = () => {
    try {
      let rusuk = this.state.photo.side / Math.sqrt(this.state.difficult)
      {
        this.state.tilesArray.map((item, key) => {
          let cropData = {
            offset: {x: item.x, y: item.y},
            size: {width: rusuk, height: rusuk},
            displaySize: {width: rusuk, height: rusuk},
            resizeMode: 'contain',
          }
          ImageEditor.cropImage(this.state.photo.uri, cropData).then((uri) => {
            this.setState({croppedImage: [...this.state.croppedImage, uri]})
          })
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.state.croppedImage}
          renderItem={({item}) => (
            <View
              style={{
                margin: 1,
              }}>
              <Image
                style={{
                  width:
                    this.state.photo.side / Math.sqrt(this.state.difficult),
                  height:
                    this.state.photo.side / Math.sqrt(this.state.difficult),
                }}
                source={{uri: item}}
              />
            </View>
          )}
          numColumns={Math.sqrt(this.state.difficult)}
          keyExtractor={(item, index) => index.toString()}
        />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
})

export default Cropper
