import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import toast from 'react-hot-toast';
import MetaMaskIcon from '../assets/images.png';

const Voting = () => {
  const { web3, account, votingContract, connectToMetaMask, disconnectFromMetaMask, connected, connecting } = useAppContext();
  const proposalRef = useRef(null);
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getProposals = async () => {
    if (votingContract) {
      const proposals = await votingContract.methods.getProposals().call();
      const formattedProposals = proposals.map((proposal) => ({
        name: proposal.name,
        voteCount: parseInt(proposal.voteCount),
      }));
      setProposals(formattedProposals);
    }
  };

  const handleAddProposal = async (e) => {
    e.preventDefault();
    if (proposalRef.current.value === '') {
      return;
    }

    try {
      setIsLoading(true);
      await votingContract.methods.addProposal(proposalRef.current.value).send({
        from: account,
        gas: 3000000,
      });
      proposalRef.current.value = '';
      toast.success('Proposal added successfully');
      getProposals();
    } catch (error) {
      toast.error('Error adding proposal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (index) => {
    try {
      setIsLoading(true);
      await votingContract.methods.vote(index).send({
        from: account,
        gas: 3000000,
      });
      toast.success('Voted successfully');
      getProposals();
    } catch (error) {
      toast.error('Error voting');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connected) {
      getProposals();
    }
  }, [connected]);

  return (
    <section className="p-4">
      <div className="flex justify-center mb-4">
        {!connected ? (
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={connectToMetaMask}
          >
            {connecting ? 'Connecting...' : 'Connect to MetaMask'}
            <img className="w-6 h-6 ml-2" src={MetaMaskIcon} alt="MetaMask Icon" />
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={disconnectFromMetaMask}
            >
              Disconnect
            </button>
            <p className="mt-2 text-gray-700">Connected as {account}</p>
          </div>
        )}
      </div>
      <div className="mb-4">
        <form onSubmit={handleAddProposal} className="flex flex-col items-center">
          <input
            type="text"
            placeholder="Enter proposal"
            ref={proposalRef}
            className="mb-2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={!connected || isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${!connected || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!connected || isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Proposal'}
          </button>
        </form>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-4">Proposals</h2>
        <ul className="list-disc pl-5">
          {proposals.map((proposal, index) => (
            <li key={index} className="mb-2">
              {proposal.name} - Votes: {proposal.voteCount}
              <button
                className="ml-4 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handleVote(index)}
                disabled={!connected || isLoading}
              >
                Vote
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Voting;

