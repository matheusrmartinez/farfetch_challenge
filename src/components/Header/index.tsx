import {
  Box,
  Divider,
  Text,
  Image,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
} from '@chakra-ui/react';

export default function Header() {
  return (
    <>
      <Box p={6} ml="auto">
        <HStack alignItems={"center"}>
          <Text  fontSize={'28px'} fontWeight={'600'}>
            SpaceX - Launches
          </Text>

        </HStack>
      </Box>
      <Box>
      <Divider />
      </Box>
    </>
  );
}
