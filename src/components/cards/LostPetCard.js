// src/components/cards/LostPetCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/api';

export default function LostPetCard({ listing, onPress }) {
    const coverImage = listing.imageUrls?.[0] || 'https://via.placeholder.com/300x200';

    const getAnimalTypeText = (type) => {
        switch (type) {
            case 'dog': return 'Köpek';
            case 'cat': return 'Kedi';
            default: return 'Diğer';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <Image
                source={{ uri: coverImage }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>🚨 KAYIP: {listing.petName}</Text>
                <Text style={styles.location} numberOfLines={1}>📍 Son Görülme: {listing.locationString}</Text>
                <View style={styles.footer}>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>{formatDate(listing.lostDate)}</Text>
                    </View>
                    <Text style={styles.type}>{getAnimalTypeText(listing.animalType)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.danger,
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: COLORS.gray[200],
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.danger,
        marginBottom: 4,
    },
    location: {
        fontSize: 13,
        color: COLORS.gray[600],
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateBadge: {
        backgroundColor: COLORS.gray[100],
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.gray[600],
    },
    type: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.gray[700],
    },
});
