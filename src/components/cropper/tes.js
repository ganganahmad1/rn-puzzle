import React from 'react'
import {View, Text, FlatList} from 'react-native'

class Tes extends React.Component {
  constructor(props) {
    super(props)

    this.data = Array.from(Array(9), (_, index) => index)

    this.zoneRefs = {}
    this.state = {
      zonePositions: [],
    }
  }

  setZonePosition = (id) => {
    if (id + 1 === this.data.length)
      Object.keys(this.zoneRefs).map((item) => {
        this.zoneRefs[item].measure((fx, fy, width, height, px, py) => {
          console.log(fx, fy, width, height, px, py)
        })
      })
  }

  keyExtractor = (item) => 'item-' + item

  renderItem = ({item}) => {
    return (
      <View
        onLayout={() => this.setZonePosition(item)}
        collapsable={false}
        ref={(ref) => (this.zoneRefs['zone-' + item] = ref)}
        style={{
          width: 100,
          height: 100,
          borderWidth: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>{item}</Text>
      </View>
    )
  }

  render() {
    return (
      <View>
        <FlatList
          keyExtractor={this.keyExtractor}
          data={this.data}
          renderItem={this.renderItem}
          numColumns={Math.sqrt(this.data.length)}
        />
      </View>
    )
  }
}

export default Tes
