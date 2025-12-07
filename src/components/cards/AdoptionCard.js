// src/components/cards/AdoptionCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/api';

export default function AdoptionCard({ listing, onPress }) {
    const coverImage = listing.imageUrls?.[0] || 'https://via.placeholder.com/300x200';

    const getGenderText = (gender) => {
        return gender === 'male' ? 'Erkek' : 'Dişi';
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <Image
                source={{ uri: coverImage }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.location} numberOfLines={1}>📍 {listing.locationString}</Text>
                <View style={styles.footer}>
                    <View style={styles.ageBadge}>
                        <Text style={styles.ageText}>{listing.age}</Text>
                    </View>
                    <Text style={styles.gender}>{getGenderText(listing.gender)}</Text>
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
        color: COLORS.gray[900],
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
    ageBadge: {
        backgroundColor: COLORS.secondary[50],
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    ageText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.secondary[600],
    },
    gender: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.gray[700],
    },
});
