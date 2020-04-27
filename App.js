import React from 'react';
import {
    StyleSheet,
    Text,
    AsyncStorage,
    TextInput,
    TouchableOpacity,
    Keyboard,
    Linking,
    Alert,
    View
} from 'react-native';
import axios from "axios";
import * as Permissions from 'expo-permissions';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

TaskManager.defineTask('background_location_task', async ({ data: { locations }, error }) => {
    if (error) {
        return;
    }

    var code = await AsyncStorage.getItem("code");

    if (!code) {
        Location.stopLocationUpdatesAsync('background_location_task')
    } else {
        axios.post('http://192.168.0.105:8000/cellphone/setlocation/' + code , {
            'lat': locations[0].coords.latitude,
            'lon': locations[0].coords.longitude
        });
    }
});

Location.stopLocationUpdatesAsync('background_location_task')
Location.startLocationUpdatesAsync('background_location_task', {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 1000,
})

export default class App extends React.Component {
    state = {
        code: '',
        codeWrited: '',
    }

    async setCode() {
        if (!this.state.codeWrited) {
            await AsyncStorage.setItem("code", this.state.codeWrited, () => {});
            Location.stopLocationUpdatesAsync('background_location_task')
        } else {
            var response = await axios
                .get('http://192.168.0.105:8000/cellphone/exists/' + this.state.codeWrited)
                .catch(error => {
                    Alert.alert('Código não encontrado!', 'Verifique o código e tente novamente!')
                })
            ;

            if (response.data.success) {
                const { status, permissions } = await Permissions.askAsync(Permissions.LOCATION);

                if (status === 'granted') {
                    await AsyncStorage.setItem("code", this.state.codeWrited, () => {});

                    Location.stopLocationUpdatesAsync('background_location_task')
                    Location.startLocationUpdatesAsync('background_location_task', {
                        accuracy: Location.Accuracy.BestForNavigation,
                        timeInterval: 1000,
                    })

                } else {
                    Alert.alert('Erro!', 'Você precisa permitir acesso a sua localização!')
                    Linking.openURL('app-settings:');
                }
            }
        }
    }

    async getCode() {
        var code = await AsyncStorage.getItem("code");
        this.setState({
            code: code
        })
        return code;
    }

    render() {
        this.getCode();

        return (
            <View style={styles.container}>
                {this.state.code ? (
                    <View style={{
                        alignItems: "center",
                    }}>
                        <Text>Seu código vinculado atual:</Text>
                        <Text>{this.state.code}</Text>
                        <Text
                            style={{ marginTop: 30 }}
                        >Para alterar o código, insira o novo código:</Text>
                    </View>
                ) : (
                    <Text
                        style={{ marginTop: 30 }}
                    >Insira o código do celular:</Text>
                )}

                <TextInput
                    style={{ height: 40, width: '50%', marginTop: 5, borderColor: 'gray', borderWidth: 1 }}
                    keyboardType={"numeric"}
                    onChangeText={(value) => {
                        this.setState({
                            codeWrited: value,
                        });
                    }}
                    returnKeyType={"next"}
                />
                <TouchableOpacity
                    hitSlop={{ top: 20, left: 20, bottom: 10, right: 20 }}
                    style={{
                        height: 40,
                        width: '50%',
                        marginTop: 15,
                        alignItems: "center",
                        backgroundColor: "#DDDDDD",
                        padding: 10
                    }}
                    onPress={() => {
                        this.setCode();
                        Keyboard.dismiss();
                    }}>
                    <Text>{this.state.code ? 'Salvar novo código' : 'Salvar código'}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
