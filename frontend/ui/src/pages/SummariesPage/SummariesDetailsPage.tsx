import { useParams } from "react-router-dom";
import { Header, Title } from "../../styles/GlobalStyles";
import { Container } from "react-bootstrap";
import { useSummaryDetails } from "../../restful/summaries";

const SummariesDetailsPage = () => {
    const { summaryId } = useParams();

    const { data, isLoading, isError, error } = useSummaryDetails(summaryId || '');

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    // The useSummaryDetails hook now returns the data directly.
    if (!data) {
        return <div>No data available.</div>;
    }

    return (
        <Container>
            <Header>
                <Title>Summary Details</Title>
            </Header>
            <div style={{ padding: '1rem' }}>
                <h3>Longer Summary:</h3>
                <p>{data?.data?.longer_summary}</p>
            </div>
        </Container>
    )
};

export default SummariesDetailsPage;