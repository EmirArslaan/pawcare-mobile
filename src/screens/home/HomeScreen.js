// src/screens/home/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { COLORS } from '../../constants/api';
import { LoadingSpinner, ErrorMessage } from '../../components/common';
import { AdoptionCard, LostPetCard, ForumPostCard } from '../../components/cards';
import apiClient from '../../api/client';

// Small horizontal card for home screen
function SmallAdoptionCard({ listing, onPress }) {
    const coverImage = listing.imageUrls?.[0] || 'https://via.placeholder.com/150';
    return (
        <TouchableOpacity style={styles.smallCard} onPress={onPress}>
            <Image source={{ uri: coverImage }} style={styles.smallCardImage} />
            <View style={styles.smallCardContent}>
                <Text style={styles.smallCardTitle} numberOfLines={1}>{listing.title}</Text>
                <Text style={styles.smallCardSubtitle} numberOfLines={1}>📍 {listing.locationString}</Text>
            </View>
        </TouchableOpacity>
    );
}

function SmallLostCard({ listing, onPress }) {
    const coverImage = listing.imageUrls?.[0] || 'https://via.placeholder.com/150';
    return (
        <TouchableOpacity style={[styles.smallCard, styles.lostCard]} onPress={onPress}>
            <Image source={{ uri: coverImage }} style={styles.smallCardImage} />
            <View style={styles.smallCardContent}>
                <Text style={[styles.smallCardTitle, { color: COLORS.danger }]} numberOfLines={1}>
                    🚨 {listing.petName}
                </Text>
                <Text style={styles.smallCardSubtitle} numberOfLines={1}>📍 {listing.locationString}</Text>
            </View>
        </TouchableOpacity>
    );
}

export default function HomeScreen({ navigation }) {
    const [data, setData] = useState({
        adoptions: [],
        lostPets: [],
        forums: [],
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchHomeData = async () => {
        try {
            setError(null);
            const [adoptionsRes, lostPetsRes, forumsRes] = await Promise.all([
                apiClient.get('/adoption?limit=5'),
                apiClient.get('/lostpets?limit=5'),
                apiClient.get('/forum?limit=5'),
            ]);

            setData({
                adoptions: adoptionsRes.data.slice(0, 5),
                lostPets: lostPetsRes.data.slice(0, 5),
                forums: forumsRes.data.slice(0, 5),
            });
        } catch (err) {
            console.error('Home data fetch error:', err);
            setError('Veriler yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHomeData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHomeData();
    };

    if (loading) {
        return <LoadingSpinner message="Ana sayfa yükleniyor..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchHomeData} />;
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Hero Section */}
            <View style={styles.hero}>
                <Text style={styles.heroEmoji}>🐾</Text>
                <Text style={styles.heroTitle}>PawCare'e Hoş Geldin!</Text>
                <Text style={styles.heroSubtitle}>
                    Sokak hayvanlarına yardım etmek için doğru yerdesin.
                </Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.primary[500] }]}
                    onPress={() => navigation.navigate('AdoptionTab')}
                >
                    <Text style={styles.actionEmoji}>🏠</Text>
                    <Text style={styles.actionText}>Sahiplen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.danger }]}
                    onPress={() => navigation.navigate('LostPets')}
                >
                    <Text style={styles.actionEmoji}>🔍</Text>
                    <Text style={styles.actionText}>Kayıp İlanları</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.secondary[500] }]}
                    onPress={() => navigation.navigate('MapTab')}
                >
                    <Text style={styles.actionEmoji}>🗺️</Text>
                    <Text style={styles.actionText}>Harita</Text>
                </TouchableOpacity>
            </View>

            {/* Latest Adoptions */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🐕 Yuva Arayanlar</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AdoptionTab')}>
                        <Text style={styles.seeAll}>Tümünü Gör →</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {data.adoptions.length === 0 ? (
                        <Text style={styles.emptyText}>Henüz ilan yok</Text>
                    ) : (
                        data.adoptions.map((item) => (
                            <SmallAdoptionCard
                                key={item._id}
                                listing={item}
                                onPress={() => navigation.navigate('AdoptionDetail', { id: item._id })}
                            />
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Latest Lost Pets */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🚨 Kayıp İlanları</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('LostPets')}>
                        <Text style={styles.seeAll}>Tümünü Gör →</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {data.lostPets.length === 0 ? (
                        <Text style={styles.emptyText}>Henüz kayıp ilanı yok</Text>
                    ) : (
                        data.lostPets.map((item) => (
                            <SmallLostCard
                                key={item._id}
                                listing={item}
                                onPress={() => navigation.navigate('LostPetDetail', { id: item._id })}
                            />
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Latest Forum Posts */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>💬 Son Konular</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ForumTab')}>
                        <Text style={styles.seeAll}>Tümünü Gör →</Text>
                    </TouchableOpacity>
                </View>
                {data.forums.length === 0 ? (
                    <Text style={styles.emptyText}>Henüz konu yok</Text>
                ) : (
                    data.forums.slice(0, 3).map((post) => (
                        <ForumPostCard
                            key={post._id}
                            post={post}
                            onPress={() => navigation.navigate('ForumDetail', { id: post._id })}
                        />
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    scrollContent: {
        paddingBottom: 24,
    },
    // Hero
    hero: {
        backgroundColor: COLORS.primary[500],
        padding: 24,
        paddingTop: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    heroEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 14,
        color: COLORS.primary[100],
        textAlign: 'center',
    },
    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        marginTop: -20,
        marginBottom: 16,
    },
    actionButton: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        minWidth: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    actionEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.white,
    },
    // Sections
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.gray[900],
    },
    seeAll: {
        fontSize: 14,
        color: COLORS.primary[500],
        fontWeight: '500',
    },
    emptyText: {
        color: COLORS.gray[500],
        fontSize: 14,
        paddingVertical: 20,
    },
    // Small Cards
    smallCard: {
        width: 160,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginRight: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lostCard: {
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    smallCardImage: {
        width: '100%',
        height: 100,
        backgroundColor: COLORS.gray[200],
    },
    smallCardContent: {
        padding: 10,
    },
    smallCardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.gray[900],
        marginBottom: 4,
    },
    smallCardSubtitle: {
        fontSize: 11,
        color: COLORS.gray[600],
    },
});
