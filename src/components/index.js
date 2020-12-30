import React from 'react'
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import Draggable from './utilities/draggable'
import NetInfo from '@react-native-community/netinfo'

const Index = (props) => {
  const data = [
    [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}],
    [{}, {id: 1}, {id: 2}, {}, {id: 4}],
  ]

  const ar = React.useState([])

  const tes = () => {
    const temp = Array.from(Array(5), (_) => Array(5))
    temp[0][4] = {id: 123, ts: 'asdawdad'}
  }

  const renderItem = (arr) => {
    // for (let i = 0; i < arr.length; i++) {
    //   let ts = 0
    //   console.log(i, 'id')
    //   console.log('---------------')
    //   for (let j = 0; j < i; j++) {
    //     if (arr[j]?.id === undefined) {
    //       ts += 1
    //     }
    //   }
    //   console.log(ts)
    //   console.log('---------------')
    // }
    return arr.map((item, key) => {
      let ts = 0
      for (let j = 0; j < key; j++) {
        if (arr[j]?.id === undefined) {
          ts += 1
        }
      }
      return (
        <Text style={{left: 8 * ts}} key={key}>
          {item.id}
        </Text>
      )
    })
  }

  React.useEffect(() => {
    tes()
  })

  const unsubscribe = NetInfo.addEventListener((state) => {
    console.log('Connection type', state.type)
    console.log('Is connected?', state.isConnected)
  })

  unsubscribe()

  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        {/* <TouchableOpacity style={styles.btn}>
          <Text style={{color: '#fff'}}>16</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.btn}
          onPress={() => props.navigation.navigate('SliceTo25')}>
          <Text style={{color: '#fff'}}>25</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.btn}
          // onPress={() => props.navigation.navigate('SliceTo36')}
        >
          <Text style={{color: '#fff'}}>36</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn}>
          <Text style={{color: '#fff'}}>64</Text>
        </TouchableOpacity> */}
      </View>
      <View>
        {data.map((item, key) => {
          return (
            <View style={{flexDirection: 'row'}} key={key}>
              {renderItem(item)}
            </View>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  btn: {
    marginHorizontal: 5,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
  },
})

export default Index
