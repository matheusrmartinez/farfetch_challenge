import { StarIcon } from '@chakra-ui/icons';
import {
  Box,
  IconButton,
  Image,
  VStack,
  Text,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { SelectedIcon } from '../../pages';
import nookies from 'nookies';

interface LaunchCardProps {
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
  };
  isIconSelected: (value: string) => boolean;
  getIconColor: (value: string) => string;
  setSelectedIcons: (value: { flightId: string; color: string }[]) => void;
  selectedIcons: SelectedIcon[];
}

export default function LaunchCard({
  docs,
  isIconSelected,
  getIconColor,
  setSelectedIcons,
  selectedIcons,
}: LaunchCardProps) {
  return (
    <Box
      key={docs?.id}
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
      <VStack mr={[1, 10]} >
        <Image
          src={docs?.links?.patch?.small}
          alt={docs?.links?.patch?.alt}
          p={2}
          boxSize="125px"
          mr={8}
        />
        <HStack>
          <Badge borderRadius='full' px='3' py={0.5} colorScheme="green">{docs?.year}</Badge>
          <Badge borderRadius='full' px='3' py= {0.5} colorScheme={docs?.success === true ? 'green' : 'red'}>
            {docs?.success === true ? 'Successful' : 'Failed'}
          </Badge>
        </HStack>
      </VStack>
      <VStack w="45%" align="flex-end"  >
        <Box mt={-5} mb={5}>
        <IconButton
          aria-label="Search database"
          size="xs"
          onClick={() => {
            if (isIconSelected(docs?.id)) {
              nookies.destroy(null, docs?.id);
              setSelectedIcons(
                selectedIcons.filter(key => key?.flightId !== docs?.id),
              );
            } else {
              nookies.set(null, docs?.id, docs?.id),
                setSelectedIcons([
                  ...selectedIcons,
                  { flightId: docs?.id, color: 'yellow.300' },
                ]);
            }
          }}
          icon={<StarIcon color={getIconColor(docs?.id)} />}
        />
        </Box>
        <Box mt="1" fontWeight="semibold" isTruncated>
          Launch Number: {docs?.flight_number}
        </Box>
        <Text mt="1" noOfLines={2} fontWeight="semibold">
          Mission: {docs?.name.slice(0,12)}
        </Text>
        <Box mt="1" fontWeight="semibold" isTruncated>
          Rocket: {docs?.rocket_name}
        </Box>
      </VStack>
    </Box>
  );
}
