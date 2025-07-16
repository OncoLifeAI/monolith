import { useParams } from "react-router-dom";
import { Header, Title } from "../../styles/GlobalStyles";
import { Container } from "react-bootstrap";
import { useSummaryDetails } from "../../restful/summaires";

const SummariesDetailsPage = () => {
    const { summaryId } = useParams();

    const { data, isLoading, isError, error } = useSummaryDetails(summaryId || '');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <Container>
            <Header>
                <Title>Summary Details</Title>
            </Header>
        </Container>
    )
};

export default SummariesDetailsPage;