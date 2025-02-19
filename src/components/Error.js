import React from "react";
import { StyleSheet, View } from "react-native";

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
    },
    error: {
        fontWeight: '600',
        color: 'red',
        flexWrap: 'wrap',
    }
});


export default Error;