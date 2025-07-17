import React, {useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, TextInput } from 'react-native';
import Checkbox from 'expo-checkbox';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface FilterProps {
  allMakes: string[];
  allModels: { [make: string]: string[] }
  allStates: string[];
  selectedMakes: string[];
  selectedModels: string[];
  selectedStates: string[];
  priceRange: number[];
  onChange: (filters: {
    makes: string[];
    models: string[];
    states: string[];
    priceRange: number[];
  }) => void;
}

const CarFilters: React.FC<FilterProps> = ({
  allMakes,
  allModels,
  allStates,
  selectedMakes,
  selectedModels,
  selectedStates,
  priceRange,
  onChange
}) => {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showMakeModelFilter, setShowMakeModelFilter] = useState(false);
  const [showStateFilter, setShowStateFilter] = useState(false);

  const toggleItem = (item: string, list: string[], type: 'makes' | 'models' | 'states') => {
    const updated = list.includes(item) 
      ? list.filter(i => i !== item) 
      : [...list, item];
    
    if (type === 'makes' && list.includes(item)) {
      const updatedModels = selectedModels.filter(
        model => !(allModels[item] || []).includes(model)
      );
      onChange({
        makes: updated,
        models: updatedModels,
        states: selectedStates,
        priceRange: priceRange,
      });
    } else {
      onChange({
        makes: type === 'makes' ? updated : selectedMakes,
        models: type === 'models' ? updated : selectedModels,
        states: type === 'states' ? updated : selectedStates,
        priceRange: priceRange
      });
    }
  };

  const handlePriceChange = (values: number[]) => {
    onChange({
      makes: selectedMakes,
      models: selectedModels,
      states: selectedStates,
      priceRange: values
    });
  };

  const [editingPrice, setEditingPrice] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState(priceRange[0].toString());
  const [tempMaxPrice, setTempMaxPrice] = useState(priceRange[1].toString());

  const applyPriceInput = () => {
    const min = parseInt(tempMinPrice);
    const max = parseInt(tempMaxPrice);
    if (!isNaN(min) && !isNaN(max) && min <= max) {
      handlePriceChange([min, max]);
    }
    setEditingPrice(false);
  };

  const [innerScrollAtEnd, setInnerScrollAtEnd] = useState(false);

  const handleInnerScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const atEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - 5;
    setInnerScrollAtEnd(atEnd);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Full filter toggle */}
      <TouchableOpacity onPress={() => setShowAllFilters(!showAllFilters)} style={styles.dropdownHeader}>
        <ThemedText type="defaultSemiBold">
          {showAllFilters ? 'Hide Filters' : `Show Filters`}
        </ThemedText>
      </TouchableOpacity>

      {showAllFilters && (
        <>
          {/* Price Filter */}
          <TouchableOpacity onPress={() => setShowPriceFilter(!showPriceFilter)} style={styles.dropdownHeader}>
            <ThemedText type="defaultSemiBold">Filter by Price</ThemedText>
          </TouchableOpacity>
          {showPriceFilter && (
            <View style={styles.sliderContainer}>
              <TouchableOpacity onPress={() => setEditingPrice(true)}>
                {!editingPrice ? (
                  <ThemedText type="defaultSemiBold">
                    {`Price Range: $${priceRange[0].toLocaleString()} - $${priceRange[1].toLocaleString()}`}
                  </ThemedText>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TextInput
                      value={tempMinPrice}
                      onChangeText={setTempMinPrice}
                      keyboardType="numeric"
                      placeholder="Min"
                      style={styles.input}
                    />
                    <Text style={{ color: 'white' }}>to</Text>
                    <TextInput
                      value={tempMaxPrice}
                      onChangeText={setTempMaxPrice}
                      keyboardType="numeric"
                      placeholder="Max"
                      style={styles.input}
                    />
                    <TouchableOpacity onPress={applyPriceInput} style={styles.applyButton}>
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
              <MultiSlider
                values={priceRange}
                min={2000}
                max={100000}
                step={500}
                onValuesChangeFinish={handlePriceChange}
                sliderLength={Dimensions.get('window').width - 100}
                selectedStyle={{ backgroundColor: '#0066cc' }}
                unselectedStyle={{ backgroundColor: '#ccc' }}
                markerStyle={{
                  backgroundColor: 'white',
                  borderColor: '#0066cc',
                  borderWidth: 2,
                }}
                containerStyle={{ alignSelf: 'center' }}
              />
            </View>
          )}

          {/* Make & Model Filter */}
          <TouchableOpacity onPress={() => setShowMakeModelFilter(!showMakeModelFilter)} style={styles.dropdownHeader}>
            <ThemedText type="defaultSemiBold">Filter by Make & Model</ThemedText>
          </TouchableOpacity>

          {showMakeModelFilter && (
            <View style={styles.leftFilterBox}>
              <ScrollView 
                style={styles.scrollSection}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                onStartShouldSetResponderCapture={() => true}
                onScroll={handleInnerScroll}
                scrollEventThrottle={16}  
              >
                {allMakes.map(make => {
                  const isSelected = selectedMakes.includes(make);
                  const modelsForMake = Array.isArray(allModels[make]) ? allModels[make] : [];
                  return (
                    <View key={make} style={styles.makeContainer}>
                      <View style={styles.checkboxRow}>
                        <Checkbox
                          value={isSelected}
                          onValueChange={() => toggleItem(make, selectedMakes, 'makes')}
                        />
                        <Text style={styles.checkboxLabel}>
                          {
                            make
                              .replace(/_/g, ' ')
                              .split(' ')
                              .map(word=>word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')
                            }
                          </Text>
                      </View>

                      {isSelected && modelsForMake.length > 0 && (
                        <View style={styles.modelList}>
                          {allModels[make].map(model => (
                            <View key={model} style={styles.checkboxRow}>
                              <Checkbox
                                value={selectedModels.includes(model)}
                                onValueChange={() => toggleItem(model, selectedModels, 'models')}
                              />
                              <Text style={styles.checkboxLabel}>
                              {
                                model
                                  .replace(/[_-]/g, ' ')
                                  .split(' ')
                                  .map(word=>word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ')
                                }
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* State Filter */}
          <TouchableOpacity onPress={() => setShowStateFilter(!showStateFilter)} style={styles.dropdownHeader}>
            <ThemedText type="defaultSemiBold">Filter by State</ThemedText>
          </TouchableOpacity>
          {showStateFilter && (
          <View style={styles.rightFilterBox}>
            <View style={styles.gridSection}>
              {allStates.map(state => (
                <View key={state} style={styles.gridItem}>
                  <Checkbox
                    value={selectedStates.includes(state)}
                    onValueChange={() => toggleItem(state, selectedStates, 'states')}
                  />
                  <Text style={styles.checkboxLabel}>{state}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        </>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  dropdownHeader: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#222',
    marginBottom: 6,
    borderRadius: 6,
  },
  sliderContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
    alignItems: 'center'
  },
  leftFilterBox: {
    marginBottom: 20,
  },
  rightFilterBox: {
    marginBottom: 20,
  },
  scrollSection: {
    maxHeight: 200,
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkboxLabel: {
    marginLeft: 5,
    color: 'white',
  },
  gridSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1, // Optional spacing between items
  },
  gridItem: {
    width: '15%', // 100 / 8 = 12.5%
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginLeft: 15,
  },
  makeContainer: {
    marginBottom: 12,
  },
  modelList: {
    paddingLeft: 20,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#292828',
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 70,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CarFilters;
