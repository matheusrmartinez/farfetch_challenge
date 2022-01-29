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
  Button,
  Grid,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import DatePicker from 'react-datepicker';
import { api } from '../services/api';
import { getYear, parseISO } from 'date-fns';
import ClipLoader from 'react-spinners/ClipLoader';
import { css } from '@emotion/react';

interface LaunchesData {
  docs: {
    links: {
      patch: {
        small: string;
        alt: string;
      };
    };
    rocket: string;
    rocket_name: string;
    success: boolean;
    flight_number: number;
    name: string;
    date_utc: string;
    year: number;
  }[];
  hasNextPage: boolean;
  id: string;
}

export default function Home() {
  const [comboBoxSelectedValue, setComboBoxSelectedValue] = useState('');
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState('#ffffff');
  // const [offSet, setOffSet] = useState(0);
  const [launchesData, setLaunchesData] = useState<LaunchesData[]>(
    [] as LaunchesData[],
  );
  const [startDate, setStartDate] = useState<Date>();
  const [lastDate, setLastDate] = useState<Date>();
  const [isAppyFilterButtonPressed, setIsAppyFilterButtonPressed] =
    useState(false);
  const [isClearFilterButtonPressed, setIsClearFilterButtonPressed] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const offSet = useRef(0);

  const handleMissionStatusValue = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setComboBoxSelectedValue(event.target.value);
  };

  const handleSuccessStatus = () => {
    switch (comboBoxSelectedValue) {
      case '1':
        return true;

      case '2':
        return false;

      case '3':
        return '';

      default:
        return '';
    }
  };

  const launchParams = {
    query: {
      // upcoming: true,
      // success: true,
      // date_utc: {
      //   $gte: new Date(),
      //   $lte: new Date(),
      // },
    },
    options: {
      select: 'flight_number rocket success date_utc name links id ',
      limit: 4,
      offset: offSet.current,
    },
  };

  useEffect(() => {
    getLaunches();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  async function getRocketName(launches: LaunchesData) {
    if (!launches) return;

    for await (let launch of launches.docs) {
      const response = await api.get(`/rockets/${launch.rocket}`);
      const { name } = response.data;
      launch.rocket_name = name;
    }
    return launches;
  }

  async function getLaunches(isBottomPageReached: boolean = false) {
    launchParams.options.offset = offSet.current;
    let launches: LaunchesData;

    const response = await api.post(`/launches/query`, launchParams);

    launches = response.data;

    const launchesUpdated = await getRocketName(launches);

    let launchesFormatted = {
      docs: launchesUpdated.docs.map(launch => {
        return {
          ...launch,
          alt: `${launch.name} logo`,
          year: getYear(parseISO(launch.date_utc)),
        };
      }),
      hasNextPage: launches.hasNextPage,
      id: launches.id,
    } as LaunchesData;

    

    setLaunchesData([...launchesData, launchesFormatted]);
    setIsLoading(false);
    offSet.current += isBottomPageReached ? 4 : 0;
  }

  const handleScroll = () => {
    const isBottomReached =
      Math.ceil(window.innerHeight + window.scrollY) >=
      document.documentElement.scrollHeight;
    if (isBottomReached) {
      console.log('caiu aqui');
      getLaunches(true);
    }
  };

  return (
    <Box>
      <Header />
      <Box mt={5}>
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
              <HStack width={'70%'} paddingX={6} mt={2}>
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
                  <option value={'1'}>Successful</option>
                  <option value={'2'}>Failed</option>
                  <option value={'3'}>All</option>
                </Select>
                <HStack>
                  <Button
                    onClick={() => {
                      setIsLoading(true);
                      getLaunches();
                    }}
                    isLoading={isLoading}
                    colorScheme="blue"
                  >
                    Apply
                  </Button>
                  <Button isLoading={isLoading} colorScheme="blue">
                    Clear
                  </Button>
                </HStack>
              </HStack>
              <Box width="50%">
                <Grid
                  mt={5}
                  templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)']}
                  templateRows="repeat(2, 1fr)"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                >
                  {launchesData?.map(launch =>
                    launch?.docs?.map(docs => (
                      <Box
                        key={launch.id}
                        display="flex"
                        flexDirection={'row'}
                        maxW="md"
                        borderWidth="1px"
                        borderRadius="lg"
                        alignItems="center"
                        justifyContent="center"
                        spacing={6}
                        p={4}
                      >
                        <Image
                          w="125px"
                          h="125px"
                          src={docs.links.patch.small}
                          alt={docs.links.patch.alt}
                          p={4}
                          mr={2}
                        />
                        <VStack p={3} spacing={2}>
                          <Box mt="1" fontWeight="semibold" isTruncated>
                            Launch Number: {docs.flight_number}
                          </Box>
                          <Text  mt="1" fontWeight="semibold" isTruncated>
                            Mission name: {docs.name.slice(0, 10)}
                          </Text>
                          <Box mt="1" fontWeight="semibold" isTruncated>
                            Year: {docs.year}
                          </Box>
                          <Box mt="1" fontWeight="semibold" isTruncated>
                            Rocket name: {docs.rocket_name}
                          </Box>
                          <HStack alignItems={'center'}>
                            <Text fontWeight="semibold" isTruncated>
                              Mission status:
                            </Text>
                            <Text
                              mt="4"
                              color={docs.success === true ? 'green' : 'red'}
                              fontWeight="semibold"
                              isTruncated
                            >
                              {docs.success === true ? 'Success' : 'Failure'}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    )),
                  )}
                </Grid>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box pl={6} mt={6}>
                <Text fontSize={'16px'}>Filters</Text>
              </Box>
              <HStack width={'70%'} paddingX={6} mt={2}>
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
                <HStack>
                  <Button isLoading={isLoading} colorScheme="blue">
                    Apply
                  </Button>
                  <Button isLoading={isLoading} colorScheme="blue">
                    Clear
                  </Button>
                </HStack>
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
                {/* <Image
                  w="125px"
                  h="125px"
                  src={property.imageUrl}
                  alt={property.imageAlt}
                /> */}
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
          </TabPanels>
        </Tabs>
      </Box>
      <ClipLoader color={color} loading={loading} size={150} />
    </Box>
  );
}
