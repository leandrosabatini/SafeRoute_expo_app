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
    View,
    SafeAreaView,
    Image
} from 'react-native';
import axios from "axios";
import * as Permissions from 'expo-permissions';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import Card from './components/Card';

TaskManager.defineTask('background_location_task', async ({ data: { locations }, error }) => {
    if (error) {
        return;
    }

    var code = await AsyncStorage.getItem("code");

    if (!code) {
        Location.stopLocationUpdatesAsync('background_location_task')
    } else {
        axios.post('https://saferoute.leandrosabatini.com.br/cellphone/setlocation/' + code, {
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
            await AsyncStorage.setItem("code", this.state.codeWrited, () => { });
            Location.stopLocationUpdatesAsync('background_location_task')
        } else {
            var response = await axios
                .get('https://saferoute.leandrosabatini.com.br/cellphone/exists/' + this.state.codeWrited)
                .catch(error => {
                    Alert.alert('Código não encontrado!', 'Verifique o código e tente novamente!')
                })
                ;

            if (response.data.success) {
                const { status, permissions } = await Permissions.askAsync(Permissions.LOCATION);

                if (status === 'granted') {
                    await AsyncStorage.setItem("code", this.state.codeWrited, () => { });

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

        var cardCode = null;
        var inputCardCode = null;

        if (this.state.code) {
            cardCode = (
                <Card style={{ width: '55%' }}>
                    <View style={{ alignItems: "center" }}>
                        <Text>Seu código vinculado atual:</Text>
                        <Text>{this.state.code}</Text>
                    </View>
                </Card>
            );

            inputCardCode = (
                <Card style={{ width: '90%' }}>
                    <TextInput
                        placeholder="Código do Celular"
                        style={styles.InputText}
                        keyboardType={"numeric"}
                        onChangeText={
                            text => this.setState({
                                codeWrited: text,
                            })
                        }
                        returnKeyType={"next"}
                        value={this.state.codeWrited}
                    />

                    <TouchableOpacity
                        style={styles.ButtonCode}
                        onPress={() => {
                            Keyboard.dismiss();
                            Alert.alert(
                                'Atualizar Código',
                                'Deseja mesmo atualizar seu código?',
                                [{
                                    text: 'Não',
                                    style: 'cancel'
                                },
                                {
                                    text: 'Sim',
                                    style: 'default',
                                    onPress: () => {
                                        this.setCode();
                                    }
                                }]
                            );
                        }}>
                        <Text style={styles.ButtonTextCode}>Salvar novo código</Text>
                    </TouchableOpacity>
                </Card>
            );
        }
        else {
            inputCardCode = (
                <Card style={{ width: '90%' }}>

                    <TextInput
                        placeholder="Código do Celular"
                        style={styles.InputText}
                        keyboardType={"numeric"}
                        onChangeText={
                            text => this.setState({
                                codeWrited: text,
                            })
                        }
                        returnKeyType={"next"}
                        value={this.state.codeWrited}
                    />

                    <TouchableOpacity
                        style={styles.ButtonCode}
                        onPress={() => {
                            this.setCode();
                            Keyboard.dismiss();
                        }}>

                        <Text style={styles.ButtonTextCode}>Salvar código</Text>

                    </TouchableOpacity>
                </Card>
            );
        }

        return (
            <SafeAreaView style={styles.container}>
                <Image
                    style={styles.MenuLogo}
                    source={
                        require('./assets/images/logo-text-black.png')
                    }
                />
                {inputCardCode}
                {cardCode}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    InputText: {
        textAlign: 'center',
        maxWidth: '50%',
        minWidth: '50%',
        height: 40,
        borderBottomColor: '#0056b3',
        borderBottomWidth: 1,
        padding: 2,
        marginBottom: 15
    },
    ButtonCode: {
        backgroundColor: '#0056b3',
        color: '#0056b3',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 25
    },
    ButtonTextCode: {
        color: "#FFF",
        fontSize: 16
    },
    MenuLogo: {
        justifyContent: "center",
        alignSelf: "center",
        alignItems: "center",
        resizeMode: 'center',
        width: '50%',
        height: '15%',
    }
});
