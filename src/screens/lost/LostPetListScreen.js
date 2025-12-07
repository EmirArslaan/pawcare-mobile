// src/screens/lost/LostPetListScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    TextInput,
} from 'react-native';
import { COLORS } from '../../constants/api';
import { LoadingSpinner, ErrorMessage, Button } from '../../components/common';
import { LostPetCard } from '../../components/cards';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';

export default function LostPetListScreen({ navigation }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        animalType: '',
        location: '',
    });

    const user = useAuthStore((state) => state.user);

    const fetchListings = async () => {
        try {
            setError(null);
            const params = new URLSearchParams();
            if (filters.animalType) params.append('animalType', filters.animalType);
            if (filters.location) params.append('location', filters.location);

            const response = await apiClient.get(`/lostpets?${params.toString()}`);
            setListings(response.data);
        } catch (err) {
            console.error('Lost pets fetch error:', err);
            setError('Kayıp ilanları yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchListings();
    }, [filters]);

    const handleFilter = () => {
        setLoading(true);
        fetchListings();
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({ animalType: '', location: '' });
    };

    if (loading && !refreshing) {
        return <LoadingSpinner message="Kayıp ilanları yükleniyor..." />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={fetchListings} />;
    }

    const FilterButton = ({ title, value, onPress, active }) => (
        <TouchableOpacity
            style={[styles.filterChip, active && styles.filterChipActive]}
            onPress={onPress}
        >
            <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🚨 Kayıp İlanları</Text>
                {user && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('CreateLostPet')}
                    >
                        <Text style={styles.addButtonText}>+ Kayıp İlanı</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Toggle */}
            <TouchableOpacity
                style={styles.filterToggle}
                onPress={() => setShowFilters(!showFilters)}
            >
                <Text style={styles.filterToggleText}>
                    🔍 Filtrele {showFilters ? '▲' : '▼'}
                </Text>
            </TouchableOpacity>

            {/* Filter Panel */}
            {showFilters && (
                <View style={styles.filterPanel}>
                    <Text style={styles.filterLabel}>Tür</Text>
                    <View style={styles.filterRow}>
                        <FilterButton
                            title="Tümü"
                            active={filters.animalType === ''}
                            onPress={() => setFilters({ ...filters, animalType: '' })}
                        />
                        <FilterButton
                            title="🐕 Köpek"
                            active={filters.animalType === 'dog'}
                            onPress={() => setFilters({ ...filters, animalType: 'dog' })}
                        />
                        <FilterButton
                            title="🐈 Kedi"
                            active={filters.animalType === 'cat'}
                            onPress={() => setFilters({ ...filters, animalType: 'cat' })}
                        />
                        <FilterButton
                            title="Diğer"
                            active={filters.animalType === 'other'}
                            onPress={() => setFilters({ ...filters, animalType: 'other' })}
                        />
                    </View>

                    <Text style={styles.filterLabel}>Konum</Text>
                    <TextInput
                        style={styles.filterInput}
                        placeholder="Örn: Kadıköy"
                        placeholderTextColor={COLORS.gray[400]}
                        value={filters.location}
                        onChangeText={(text) => setFilters({ ...filters, location: text })}
                    />

                    <View style={styles.filterActions}>
                        <Button title="Filtrele" onPress={handleFilter} size="small" variant="danger" />
                        <Button
                            title="Temizle"
                            onPress={clearFilters}
                            variant="outline"
                            size="small"
                            style={{ marginLeft: 8 }}
                        />
                    </View>
                </View>
            )}

            {/* Listing */}
            <FlatList
                data={listings}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <LostPetCard
                        listing={item}
                        onPress={() => navigation.navigate('LostPetDetail', { id: item._id })}
                    />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🔍</Text>
                        <Text style={styles.emptyText}>Kayıp ilanı bulunamadı.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.gray[900],
    },
    addButton: {
        backgroundColor: COLORS.danger,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '600',
    },
    // Filter styles same as AdoptionListScreen
    filterToggle: {
        backgroundColor: COLORS.white,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    filterToggleText: {
        fontSize: 14,
        color: COLORS.gray[700],
        fontWeight: '500',
    },
    filterPanel: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray[200],
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.gray[700],
        marginBottom: 8,
        marginTop: 8,
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    filterChip: {
        backgroundColor: COLORS.gray[200],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    filterChipActive: {
        backgroundColor: COLORS.danger,
    },
    filterChipText: {
        fontSize: 13,
        color: COLORS.gray[700],
    },
    filterChipTextActive: {
        color: COLORS.white,
        fontWeight: '500',
    },
    filterInput: {
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: COLORS.gray[900],
    },
    filterActions: {
        flexDirection: 'row',
        marginTop: 16,
    },
    listContent: {
        padding: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.gray[500],
    },
});
