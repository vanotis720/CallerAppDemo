import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Error = ({ error }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.error}>{error}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    error: {
        fontWeight: '600',
        color: 'red',
        flexWrap: 'wrap',
    }
});


export default Error;