import { Center, Divider as ChakraDivider } from '@chakra-ui/react';
import React from 'react';

export default function Divider() {
  return (
    <Center>
      <ChakraDivider
        orientation="horizontal"
        bg="black"
        color={'black'}
        height="2px"
      />
    </Center>
  );
}
