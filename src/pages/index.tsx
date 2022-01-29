import 'react-datepicker/dist/react-datepicker.css';

import {
  Text,
  HStack,
  Input,
  Image,
  Box,
  Select,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import Header from '../components/Header';
import DatePicker from 'react-datepicker';

export default function Home() {
  const [comboBoxSelectedValue, setComboBoxSelectedValue] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [lastDate, setLastDate] = useState<Date>();

  const handleMissionStatusValue = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setComboBoxSelectedValue(event.target.value);
  };

  const property = {
    imageUrl: 'https://images2.imgbox.com/3c/0e/T8iJcSN3_o.png',
    imageAlt: 'Rear view of modern home with pool',
    beds: 3,
    baths: 2,
    title: 'Modern home in city center in the heart of historic Los Angeles',
    formattedPrice: '$1,900.00',
    reviewCount: 34,
    rating: 4,
  };

  return (
    <>
      <Header />
      <Box flex={0.5} mt={5}>
        <Tabs align="center" variant="soft-rounded" size={'lg'}>
          <TabList>
            <Tab>Past</Tab>
            <Tab>Upcoming</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box pl={6} mt={6}>
                <Text fontSize={'16px'}>Filters</Text>
              </Box>
              <HStack width={'60%'} paddingX={6} mt={2}>
                <DatePicker
                  placeholderText="From"
                  customInput={<Input />}
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                />
                <DatePicker
                  placeholderText="To"
                  customInput={<Input />}
                  selected={lastDate}
                  onChange={date => setLastDate(date)}
                />
                <Select
                  size={'md'}
                  value={comboBoxSelectedValue}
                  onChange={event => {
                    handleMissionStatusValue(event);
                  }}
                  placeholder="Select a mission status"
                >
                  <option value={'1'}>Success</option>
                  <option value={'2'}>Failure</option>
                  <option value={'3'}>All</option>
                </Select>
              </HStack>
              <Box
                display="flex"
                flexDirection={'row'}
                maxW="sm"
                borderWidth="1px"
                borderRadius="lg"
                alignItems="center"
                justifyContent="center"
                p={4}
                mt={6}
              >
                <Image
                  w="125px"
                  h="125px"
                  src={property.imageUrl}
                  alt={property.imageAlt}
                />
                <VStack pl={3} spacing={1}>
                  <Box mt="1" fontWeight="semibold" isTruncated>
                    Launch Number: 1
                  </Box>
                  <Box mt="1" fontWeight="semibold" isTruncated>
                    Mission name: FalconSat
                  </Box>
                  <Box mt="1" fontWeight="semibold" isTruncated>
                      Date: 01/28/2022
                    </Box>
                  <Box mt="1" fontWeight="semibold" isTruncated>
                    Rocket name: Falcon 1
                  </Box>
                  <Box mt="1" fontWeight="semibold" isTruncated>
                    Mission status: failure
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box pl={6} mt={6}>
                <Text>Filters</Text>
              </Box>
              <HStack width={'60%'} paddingX={6} mt={2}>
                <DatePicker
                  placeholderText="From"
                  customInput={<Input />}
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                />
                <DatePicker
                  placeholderText="To"
                  customInput={<Input />}
                  selected={lastDate}
                  onChange={date => setLastDate(date)}
                />
                <Select
                  size={'md'}
                  value={comboBoxSelectedValue}
                  onChange={event => {
                    handleMissionStatusValue(event);
                  }}
                  placeholder="Select a mission status"
                >
                  <option value={'1'}>Success</option>
                  <option value={'2'}>Failure</option>
                  <option value={'3'}>All</option>
                </Select>
              </HStack>
              <Box
                flexDirection={'column'}
                mt={6}
                ml={6}
                maxW="sm"
                h="sm"
                borderWidth="1px"
                borderRadius="lg"
              >
                <Image src={property.imageUrl} alt={property.imageAlt} />

                <Box p="6">
                  <Box display="flex" alignItems="baseline">
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                      New
                    </Badge>
                    <Box
                      color="gray.500"
                      fontWeight="semibold"
                      letterSpacing="wide"
                      fontSize="xs"
                      textTransform="uppercase"
                      ml="2"
                    >
                      {property.beds} beds &bull; {property.baths} baths
                    </Box>
                  </Box>
                  <Box
                    mt="1"
                    fontWeight="semibold"
                    as="h4"
                    lineHeight="tight"
                    isTruncated
                  >
                    {property.title}
                  </Box>
                  <Box>
                    {property.formattedPrice}
                    <Box as="span" color="gray.600" fontSize="sm">
                      / wk
                    </Box>
                  </Box>
                  <Box display="flex" mt="2" alignItems="center">
                    <Box as="span" ml="2" color="gray.600" fontSize="sm">
                      {property.reviewCount} reviews
                    </Box>
                  </Box>
                </Box>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
}
