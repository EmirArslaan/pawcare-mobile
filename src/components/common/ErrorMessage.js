// src/components/common/ErrorMessage.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/api';

export default function ErrorMessage({ message = 'Bir hata oluştu.', onRetry }) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>😿</Text>
            <Text style={styles.text}>{message}</Text>
            {onRetry && (
                <TouchableOpacity style={styles.button} onPress={onRetry}>
                    <Text style={styles.buttonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray[100],
        padding: 20,
    },
    icon: {
        fontSize: 48,
        marginBottom: 16,
    },
    text: {
        fontSize: 16,
        color: COLORS.danger,
        textAlign: 'center',
        marginBottom: 16,
    },
    button: {
        backgroundColor: COLORS.primary[500],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
});
