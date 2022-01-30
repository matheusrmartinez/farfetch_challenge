import 'react-datepicker/dist/react-datepicker.css';

import {
  Text,
  HStack,
  Input,
  Image,
  Box,
  Select,
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
    id: string;
  }[];
  hasNextPage: boolean;
}

export default function Home() {
  const [comboBoxPastSelectedValue, setComboBoxPastSelectedValue] =
    useState('');
  const [comboBoxUpComingSelectedValue, setComboBoxUpComingSelectedValue] =
    useState('');
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState('#ffffff');
  const [pastLaunchesData, setPastLaunchesData] = useState<LaunchesData[]>(
    [] as LaunchesData[],
  );
  const [upComingLaunchesData, setUpcomingLaunchesData] = useState<
    LaunchesData[]
  >([] as LaunchesData[]);
  const [pastStartDate, setPastStartDate] = useState<Date>();
  const [pastLastDate, setPastLastDate] = useState<Date>();
  const [upComingStartDate, setUpComingStartDate] = useState<Date>();
  const [upComingLastDate, setUpComingLastDate] = useState<Date>();
  const [isAppyFilterButtonPressed, setIsAppyFilterButtonPressed] =
    useState(false);
  const [isClearFilterButtonPressed, setIsClearFilterButtonPressed] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBottomPageReached, setIsBottomPageReached] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const pastOffSet = useRef(0);
  const upComingOffSet = useRef(0);

  useEffect(() => {
    getPastLaunches();
    getUpcomingLaunches();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isBottomPageReached) {
      tabIndex === 0 ? getPastLaunches() : getUpcomingLaunches();
    }
  }, [isBottomPageReached]);

  useEffect(() => {
    if (isAppyFilterButtonPressed || isClearFilterButtonPressed) {
      tabIndex === 0 ? getPastLaunches() : getUpcomingLaunches();
    }
  }, [isAppyFilterButtonPressed, isClearFilterButtonPressed]);

  const handleMissionStatusValue = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    tabIndex === 0
      ? setComboBoxPastSelectedValue(event.target.value)
      : setComboBoxUpComingSelectedValue(event.target.value);
  };

  async function getRocketName(launches: LaunchesData) {
    if (!launches) return;

    for await (let launch of launches.docs) {
      const response = await api.get(`/rockets/${launch.rocket}`);
      const { name } = response.data;
      launch.rocket_name = name;
    }
    return launches;
  }

  async function getPastLaunches() {
    let launches: LaunchesData = {} as LaunchesData;

    const params = {
      query: getQueryParams(true),
      options: {
        select: 'flight_number rocket success date_utc name links id ',
        limit: 4,
        offset: pastOffSet.current,
      },
    };

    const response = await api.post(`/launches/query`, params);
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
    } as LaunchesData;

    setPastLaunchesData([...pastLaunchesData, launchesFormatted]);
    setIsLoading(false);
    setIsAppyFilterButtonPressed(false);
    setIsClearFilterButtonPressed(false);
    pastOffSet.current += 4;
  }

  async function getUpcomingLaunches() {
    console.log('caiu')
    let launches: LaunchesData;

    const params = {
      query: getQueryParams(false),
      options: {
        select: 'flight_number rocket success date_utc name links id ',
        limit: 4,
        offset: upComingOffSet.current,
      },
    };

    const response = await api.post(`/launches/query`, params);

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
    } as LaunchesData;

    setUpcomingLaunchesData([...upComingLaunchesData, launchesFormatted]);
    setIsLoading(false);
    setIsAppyFilterButtonPressed(false);
    setIsClearFilterButtonPressed(false);
    upComingOffSet.current += 4;
  }

  const handleScroll = () => {
    setIsBottomPageReached(
      Math.ceil(window.innerHeight + window.scrollY) >=
        document.documentElement.scrollHeight,
    );
  };

  function getQueryParams(isPastLaunch: boolean) {
    let params: object = {};

    params = {
      ...{ ...params, upcoming: !isPastLaunch },
      ...(pastStartDate &&
        pastLastDate && {
          ...params,
          date_utc: { $gte: pastStartDate, $lte: pastLastDate },
        }),
      ...(pastStartDate &&
        !pastLastDate && { ...params, date_utc: { $gte: pastStartDate } }),
      ...(!pastStartDate &&
        pastLastDate && { ...params, date_utc: { $lte: pastLastDate } }),
      ...(comboBoxPastSelectedValue === '1' && { ...params, success: true }),
      ...(comboBoxPastSelectedValue === '2' && { ...params, success: false }),
    };

    return params;
  }

  const clearFilters = () => {
    if (tabIndex === 0) {
      setPastStartDate(null);
      setPastLastDate(null);
      setComboBoxPastSelectedValue('');
    } else {
      setUpComingStartDate(null);
      setUpComingLastDate(null);
      setComboBoxUpComingSelectedValue('');
    }
  };

  return (
    <Box>
      <Header />
      <Box mt={5}>
        <Tabs
          onChange={index => setTabIndex(index)}
          align="center"
          variant="soft-rounded"
          size={'lg'}
        >
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
                  selected={pastStartDate}
                  onChange={date => setPastStartDate(date)}
                />
                <DatePicker
                  placeholderText="To"
                  customInput={<Input />}
                  selected={pastLastDate}
                  onChange={date => setPastLastDate(date)}
                />
                <Select
                  size={'md'}
                  value={comboBoxPastSelectedValue}
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
                      setIsAppyFilterButtonPressed(true);
                      setPastLaunchesData([]);
                      pastOffSet.current = 0;
                    }}
                    isLoading={isLoading}
                    colorScheme="blue"
                  >
                    Apply
                  </Button>
                  <Button
                    onClick={() => {
                      setIsLoading(true);
                      setIsClearFilterButtonPressed(true);
                      setPastLaunchesData([]);
                      clearFilters();
                      pastOffSet.current = 0;
                    }}
                    isLoading={isLoading}
                    colorScheme="blue"
                  >
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
                  {pastLaunchesData?.map(launch =>
                    launch?.docs?.map(docs => (
                      <Box
                        key={docs.id}
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
                          <Text mt="1" fontWeight="semibold" isTruncated>
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
                              {docs.success === true
                                ? 'Success'
                                : docs.success === false
                                ? 'Failure'
                                : ''}
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
                  selected={upComingStartDate}
                  onChange={date => setUpComingStartDate(date)}
                />
                <DatePicker
                  placeholderText="To"
                  customInput={<Input />}
                  selected={upComingLastDate}
                  onChange={date => setUpComingLastDate(date)}
                />
                <Select
                  size={'md'}
                  value={comboBoxUpComingSelectedValue}
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
                      setIsAppyFilterButtonPressed(true);
                      setUpcomingLaunchesData([]);
                      upComingOffSet.current = 0;
                    }}
                    isLoading={isLoading}
                    colorScheme="blue"
                  >
                    Apply
                  </Button>
                  <Button
                    onClick={() => {
                      setIsLoading(true);
                      setIsClearFilterButtonPressed(true);
                      setUpcomingLaunchesData([]);
                      clearFilters();
                      upComingOffSet.current = 0;
                      getUpcomingLaunches();
                    }}
                    isLoading={isLoading}
                    colorScheme="blue"
                  >
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
                  {upComingLaunchesData?.map(launch =>
                    launch?.docs?.map(docs => (
                      <Box
                        key={docs.id}
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
                          <Text mt="1" fontWeight="semibold" isTruncated>
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
                              {docs.success === true
                                ? 'Success' 
                                : docs.success === false
                                ? 'Failure'
                                : ''}
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    )),
                  )}
                </Grid>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <ClipLoader color={color} loading={loading} size={150} />
    </Box>
  );
}
