import React from 'react'
import {
  Text,
  SafeAreaView,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native'

const HitungKata = () => {
  const [value, setValue] = React.useState('')
  const [keyword, setKeyword] = React.useState('')
  const [total, setTotal] = React.useState(null)

  const handleSubmit = () => {
    const split = value
      .toLowerCase()
      .split(' ')
      .filter((filter) => filter.includes(keyword.toLowerCase()))
    setTotal(split.length)
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          borderBottomWidth: 2,
          borderColor: '#000',
          height: 75,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{fontSize: 20}}>Aplikasi Hitung Kata</Text>
      </View>
      <View style={{flex: 1, margin: 10}}>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#000',
            padding: 5,
          }}>
          <TextInput
            autoCapitalize="none"
            multiline={true}
            numberOfLines={10}
            onChangeText={(val) => setValue(val)}
            value={value}
            style={{height: 150, textAlignVertical: 'top'}}
            placeholder="Type Something Here"
          />
        </View>
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#000',
              padding: 5,
              flex: 1,
            }}>
            <TextInput
              autoCapitalize="none"
              value={keyword}
              onChangeText={(val) => setKeyword(val)}
              placeholder="Type Keyword"
            />
          </View>
          <TouchableOpacity
            onPress={() => handleSubmit()}
            style={{
              backgroundColor: 'blue',
              height: 60,
              width: 100,
              justifyContent: 'center',
            }}>
            <Text style={{color: '#fff', textAlign: 'center'}}>Submit</Text>
          </TouchableOpacity>
        </View>
        <Text>Jumlah Kata : {total}</Text>
      </View>
    </SafeAreaView>
  )
}

export default HitungKata
