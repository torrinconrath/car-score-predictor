import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking, View } from 'react-native';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Dimensions } from 'react-native';
import { getScoreRating } from "../../utils/scoreRating";
import { fetchConfig } from "../../utils/fetchConfig";
import CarFilters from '../../utils/carFilters';

interface Car {
  value: any;
  id: number;
  title: string;
  model: string;
  modelTitle: string;
  condition: string;
  year: string;
  mileage: string;
  price: string;
  monthlyPayment: string;
  dealer: string;
  region: string;
  link: string;
}

const { width, height } = Dimensions.get('window');

export default function DataScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20); // same as backend
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [priceRange, setPriceRange] = useState([2000, 100000]);
  const [minPrice, maxPrice] = priceRange;
  const [allMakes, setAllMakes] = useState<string[]>([]);
  const [allModels, setAllModels] = useState<{ [make: string]: string[] }>({});
  const [allStates, setAllStates] = useState<string[]>([]);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const config = await fetchConfig();
        const makeParams = selectedMakes.map(m => `make=${encodeURIComponent(m)}`).join('&');
        const modelParams = selectedModels.map(m => `model=${encodeURIComponent(m)}`).join('&');
        const stateParams = selectedStates.map(s => `state=${encodeURIComponent(s)}`).join('&');

        const response = await fetch(`http://${config.ip}:${config.port}/cars?page=${page}&per_page=${perPage}&min_price=${minPrice}&max_price=${maxPrice}&${makeParams}&${modelParams}&${stateParams}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setCars(data.cars);
        setPage(data.page);
        setPerPage(data.per_page);
        setTotal(data.total);
        setTotalPages(Math.ceil((data.total || 0) / perPage));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching cars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [page, perPage, priceRange, selectedMakes, selectedModels, selectedStates]);


  useEffect(() => {
    const fetchMetadata = async () => {
      const config = await fetchConfig();
      const res = await fetch(`http://${config.ip}:${config.port}/metadata`);
      const meta = await res.json();
      setAllMakes(meta.makes);
      setAllModels(meta.models_by_make);
      setAllStates(meta.states);
    };
    fetchMetadata();
  }, []);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePressLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  const renderCarItem = ({ item }: { item: Car }) => (
  <ThemedView style={styles.carContainer}>
    <TouchableOpacity onPress={() => handlePressLink(item.link)}>
      <ThemedText type="title" style={styles.carTitle}>
        {item.title}
      </ThemedText>
    </TouchableOpacity>
    
    {/* Only render rows that have content */}
    {item.model && (
      <ThemedView style={styles.detailsRow}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }} >Model: </ThemedText>
        <ThemedText type="default" style={{ fontSize: 14, flex: 1, textAlign: 'right' }} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.75} >{item.modelTitle}</ThemedText>
      </ThemedView>
    )}
    
    {item.year && (
      <ThemedView style={styles.detailsRow}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Year: </ThemedText>
        <ThemedText type="default" style={{ fontSize: 14 }} >{item.year}</ThemedText>
      </ThemedView>
    )}
    
    {item.condition && (
      <ThemedView style={styles.detailsRow}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Condition: </ThemedText>
        <ThemedText type="default" style={{ fontSize: 14, flex: 1, textAlign: 'right'  }} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.75}>{item.condition}</ThemedText>
      </ThemedView>
    )}
    
    {item.mileage && (
      <ThemedView style={styles.detailsRow}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }} >Mileage: </ThemedText>
        <ThemedText type="default" style={{ fontSize: 14 }}>{item.mileage}</ThemedText>
      </ThemedView>
    )}
    
    {item.price && (
      <ThemedView style={styles.detailsRow}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Price: </ThemedText>
        <ThemedText type="default" style={{ fontSize: 14 }}>{item.price}</ThemedText>
      </ThemedView>
    )}
    
    {item.monthlyPayment && (
      <ThemedView style={styles.detailsRow}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Monthly: </ThemedText>
        <ThemedText type="default" style={{ fontSize: 14 }}>{item.monthlyPayment}</ThemedText>
      </ThemedView>
    )}
    
    {item.dealer && (
      <ThemedView style={styles.detailsRow}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Dealer:</ThemedText>
        <ThemedText type="default" style={{ fontSize: 14, flex: 1, textAlign: 'right'  }} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.75}>{item.dealer}</ThemedText>
      </ThemedView>
    )}

    {item.dealer && (
      <ThemedView style={styles.detailsRow}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Region:</ThemedText>
        <ThemedText type="default" style={{ fontSize: 14, flex: 1, textAlign: 'right'  }} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.75}>{item.region}</ThemedText>
      </ThemedView>
    )}

    {item.value && (
      <ThemedView style={styles.detailsRow}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>Value: </ThemedText>
        <ThemedText 
          type="default" 
          style={{ fontSize: 14, flex: 1, textAlign: 'right', color: getScoreRating(item.value).color }} 
          adjustsFontSizeToFit 
          numberOfLines={2} 
          minimumFontScale={0.75}
        >
          {`${getScoreRating(item.value).rating} (${item.value})`}</ThemedText>
      </ThemedView>
    )}
    
    <TouchableOpacity 
      onPress={() => handlePressLink(item.link)}
      style={styles.linkButton}
    >
      <ThemedText type="defaultSemiBold" style={styles.linkText}>
        View Details
      </ThemedText>
    </TouchableOpacity>
  </ThemedView>
);

const renderPagination = () => (
    <ThemedView style={styles.paginationContainer}>
      <TouchableOpacity 
        onPress={() => goToPage(1)} 
        disabled={page === 1}
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
      >
        <ThemedText type="defaultSemiBold" style={styles.paginationText} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.5}>
          First
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => goToPage(page - 1)} 
        disabled={page === 1}
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
      >
        <ThemedText type="defaultSemiBold" style={styles.paginationText} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.5}>
          Prev
        </ThemedText>
      </TouchableOpacity>
      
      <ThemedText type="defaultSemiBold" style={styles.pageInfo}>
        Page {page} of {totalPages}
      </ThemedText>
      
      <TouchableOpacity 
        onPress={() => goToPage(page + 1)} 
        disabled={page === totalPages}
        style={[styles.paginationButton, page === totalPages && styles.disabledButton]}
      >
        <ThemedText type="defaultSemiBold" style={styles.paginationText} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.5}>
          Next
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => goToPage(totalPages)} 
        disabled={page === totalPages}
        style={[styles.paginationButton, page === totalPages && styles.disabledButton]}
      >
        <ThemedText type="defaultSemiBold" style={styles.paginationText} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.5}>
          Last
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

    return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/car2.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{textAlign: 'center'}}>Available Used Cars with Perfect History</ThemedText>
      </ThemedView>

      <CarFilters
        allMakes={allMakes}
        allModels={allModels}
        allStates={allStates}
        selectedMakes={selectedMakes}
        selectedModels={selectedModels}
        selectedStates={selectedStates}
        priceRange={priceRange}
        onChange={({ makes, models, states, priceRange }) => {
          setSelectedMakes(makes);
          setSelectedModels(models);
          setSelectedStates(states);
          setPriceRange(priceRange);
          setPage(1); // Reset pagination on filter change
        }}
      />

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Loading cars...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.errorContainer}>
          <ThemedText type="defaultSemiBold" style={styles.errorText}>
            Error loading cars:
          </ThemedText>
          <ThemedText type="default" style={styles.errorText}>
            {error}
          </ThemedText>
        </ThemedView>
      ) : cars.length > 0 ? (
        <View>
          {renderPagination()}
          <FlatList
            data={cars}
            renderItem={renderCarItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
          {renderPagination()}
        </View>
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText type="default">No cars available</ThemedText>
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: height * 0.3,
    width: width,
    resizeMode: 'cover',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: verticalScale(10),
    paddingHorizontal: 16,
  },
  carContainer: {
    padding: 16,
    marginBottom: verticalScale(10),
    borderRadius: 8,
    backgroundColor: '#292828',
    marginHorizontal: 10,
  },
  carTitle: {
    fontSize: moderateScale(18),
    marginBottom: verticalScale(10),
    color: '#0066cc',
    textAlign: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#292828',
    marginBottom: verticalScale(10),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: verticalScale(10),
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 10,
  },
  errorText: {
    color: '#d32f2f',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
    backgroundColor: '#151718',
  },
  linkButton: {
    marginTop: verticalScale(10),
    padding: 8,
    backgroundColor: '#0066cc',
    borderRadius: 4,
    alignItems: 'center',
  },
  linkText: {
    color: 'white',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#292828',
    marginBottom: verticalScale(10),
  },
  paginationButton: {
    padding: 2,
    borderRadius: 4,
    backgroundColor: '#0066cc',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  paginationText: {
    fontSize: 14,
    color: 'white',
  },
  pageInfo: {
    color: '#ffffff',
  },
  totalText: {
    color: '#ffffff',
    fontSize: moderateScale(14),
  },
});