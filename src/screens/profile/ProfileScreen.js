// src/screens/profile/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
} from 'react-native';
import { COLORS } from '../../constants/api';
import { LoadingSpinner, ErrorMessage, Button } from '../../components/common';
import { AdoptionCard, LostPetCard, ForumPostCard } from '../../components/cards';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

export default function ProfileScreen({ navigation }) {
    const [data, setData] = useState({
        adoptions: [],
        lostPets: [],
        forumPosts: [],
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { user, logout } = useAuthStore();

    const fetchUserData = async () => {
        try {
            const [adoptionsRes, lostPetsRes, forumRes] = await Promise.all([
                apiClient.get('/adoption'),
                apiClient.get('/lostpets'),
                apiClient.get('/forum'),
            ]);

            // Filter to only show user's own listings
            setData({
                adoptions: adoptionsRes.data.filter((item) => item.user?._id === user._id),
                lostPets: lostPetsRes.data.filter((item) => item.user?._id === user._id),
                forumPosts: forumRes.data.filter((item) => item.user?._id === user._id),
            });
        } catch (error) {
            console.error('Profile data error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserData();
    };

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    if (!user) {
        return (
            <View style={styles.notLoggedIn}>
                <Text style={styles.notLoggedInEmoji}>🔒</Text>
                <Text style={styles.notLoggedInTitle}>Giriş Yapmalısınız</Text>
                <Text style={styles.notLoggedInText}>
                    Profilinizi görüntülemek için lütfen giriş yapın.
                </Text>
                <Button
                    title="Giriş Yap"
                    onPress={() => navigation.navigate('Login')}
                    style={{ marginTop: 24 }}
                />
            </View>
        );
    }

    if (loading) {
        return <LoadingSpinner message="Profil yükleniyor..." />;
    }

    // Check if user has any ads (adoptions or lost pets)
    const hasNoAds = data.adoptions.length === 0 && data.lostPets.length === 0;

    // Render My Ownership Ads Section
    const renderAdoptionsSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>🐾 My Ownership Ads</Text>
            {data.adoptions.length === 0 ? (
                <Text style={styles.sectionEmptyText}>No ownership ads yet</Text>
            ) : (
                data.adoptions.map((item) => (
                    <AdoptionCard
                        key={item._id}
                        listing={item}
                        onPress={() => navigation.navigate('AdoptionDetail', { id: item._id })}
                    />
                ))
            )}
        </View>
    );

    // Render My Lost Ads Section
    const renderLostPetsSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 My Lost Ads</Text>
            {data.lostPets.length === 0 ? (
                <Text style={styles.sectionEmptyText}>No lost pet ads yet</Text>
            ) : (
                data.lostPets.map((item) => (
                    <LostPetCard
                        key={item._id}
                        listing={item}
                        onPress={() => navigation.navigate('LostPetDetail', { id: item._id })}
                    />
                ))
            )}
        </View>
    );

    // Render Forum Posts Section
    const renderForumSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 My Forum Posts</Text>
            {data.forumPosts.length === 0 ? (
                <Text style={styles.sectionEmptyText}>No forum posts yet</Text>
            ) : (
                data.forumPosts.map((item) => (
                    <ForumPostCard
                        key={item._id}
                        post={item}
                        onPress={() => navigation.navigate('ForumDetail', { id: item._id })}
                    />
                ))
            )}
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user.username?.[0]?.toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.email}>{user.email}</Text>

                <View style={styles.stats}>
                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>{data.adoptions.length}</Text>
                        <Text style={styles.statLabel}>Sahiplendirme</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>{data.lostPets.length}</Text>
                        <Text style={styles.statLabel}>Kayıp</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>{data.forumPosts.length}</Text>
                        <Text style={styles.statLabel}>Konu</Text>
                    </View>
                </View>
            </View>

            {/* Ads Sections */}
            <View style={styles.content}>
                {hasNoAds ? (
                    <EmptyState text="You currently have no ads" />
                ) : (
                    <>
                        {renderAdoptionsSection()}
                        {renderLostPetsSection()}
                    </>
                )}

                {/* Forum Section - Always show separately */}
                {renderForumSection()}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>🚪 Çıkış Yap</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function EmptyState({ text }) {
    return (
        <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    scrollContent: {
        paddingBottom: 32,
    },
    // Not Logged In
    notLoggedIn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: COLORS.gray[100],
    },
    notLoggedInEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    notLoggedInTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.gray[900],
        marginBottom: 8,
    },
    notLoggedInText: {
        fontSize: 15,
        color: COLORS.gray[600],
        textAlign: 'center',
    },
    // Header
    header: {
        backgroundColor: COLORS.primary[500],
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.primary[500],
    },
    username: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.white,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: COLORS.primary[100],
        marginBottom: 20,
    },
    // Stats
    stats: {
        flexDirection: 'row',
        backgroundColor: COLORS.white + '20',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    stat: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.primary[100],
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.white + '40',
    },
    // Content
    content: {
        padding: 16,
        marginTop: 16,
    },
    // Sections
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.gray[900],
        marginBottom: 12,
    },
    sectionEmptyText: {
        fontSize: 14,
        color: COLORS.gray[500],
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 12,
        textAlign: 'center',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 15,
        color: COLORS.gray[500],
    },
    // Logout
    logoutButton: {
        marginHorizontal: 16,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.danger,
    },
});
