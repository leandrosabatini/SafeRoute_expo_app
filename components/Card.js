import React from 'react';
import { StyleSheet, View } from 'react-native';

export default Card = (props) => {
    return (
        <View style={{ ...styles.cartao, ...props.style }}>
            {props.children}
        </View>
    );
}

const styles = StyleSheet.create({
    cartao: {
        backgroundColor: '#fff',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 2,
        shadowOpacity: 0.01,
        elevation: 3,
        padding: 20,
        margin: 8,
        borderRadius: 1
    }
});