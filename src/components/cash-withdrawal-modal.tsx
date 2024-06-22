import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
  } from '@chakra-ui/react'
type WithdrawalData = {
    transactionMethod:string;
    amount:number;
}
const CashWithdrawalModal=({isOpen, onOpen, onClose}:{
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
})=>{
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
      } = useForm<WithdrawalData>();
    return(

<Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <form
                onSubmit={handleSubmit(onSubmit)}
                className="form-control m-4"
              >
                <FormControl
                  className="mb-6"
                  isInvalid={Boolean(errors.patientName)}
                >
                  <FormLabel className="font-bold text-black" htmlFor="name">
                    Patient Name
                  </FormLabel>
                  <Select
                    className="w-full"
                    placeholder="Patient Name"
                    {...register("patientName", {
                      required: "name is required",
                    })}
                  />
                  <FormErrorMessage>
                    {errors?.patientName?.message}
                  </FormErrorMessage>
                </FormControl>        
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant='ghost'>Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )    
}