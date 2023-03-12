import ProcessBar from "./ProcessBar";
import bannerImage from "../assets/img/whey-token.png";
import coinsImage from "../assets/img/coins.png";
import { ClaimButton } from "./styleHook";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import SyncLoader from "react-spinners/SyncLoader";
import { calculateAvailableReward, claimReward, getGlobalState } from "../contexts/helper";
import { SHOW_REWARD_FIXED } from "../config";

export default function HomeBanner({ forceRender, ...props }) {
	const wallet = useWallet();
	const [loading, setLoading] = useState(false);
	const [rewardValue, setRewardValue] = useState(0);
	const [totalGlabalStakedCnt, setTotalGlabalStakedCnt] = useState(0);
	const [hide, setHide] = useState(false);

	const getReward = async () => {
		const reward = await calculateAvailableReward(wallet.publicKey);
		setRewardValue(reward);
	}
	const onClaim = () => {
		claimReward(wallet, () => setLoading(true), () => setLoading(false));
		setHide(!hide);
	}

	const getGlobalStateNFTs = async () => {
		const list = await getGlobalState();
		setTotalGlabalStakedCnt(list.totalStakedCount.toNumber());
	}
	const updateBannerStates = () => {
		const intv = setInterval(() => {
			getGlobalStateNFTs();
			getReward();
		}, 5000);
		return intv;
	}

	useEffect(() => {
		let intv = -1;
		if (wallet.publicKey !== null) {
			intv = updateBannerStates();
		}
		return () => {
			if (intv !== -1) {
				clearInterval(intv);
				console.log('clear interval', intv);
			}
		}
		// eslint-disable-next-line
	}, [wallet.connected, hide])

	return (
		<div className="home-banner">
			<div className="home-banner-content">
				<h1>Earn <span>$WHEY</span> By Staking Your Shredded Apes</h1>
				<p>Staking is when your ape is shredding in local Shredded Apes Gym.
					It&apos;s up to you to decide for how long you want to send your apes to the gym -
					you can cancel the staking and receive earned rewards at any given time.</p>
				{wallet.publicKey !== null &&
					<ProcessBar value={totalGlabalStakedCnt} forceRender={hide} />
				}
				<p>Staking 1 ape generates 10 $WHEY per day. If you stake 3 apes,
					each ape will pump you x1.25 more $WHEY!</p>
			</div>
			<div className="home-banner-image">
				{wallet.publicKey === null ?
					<img
						src={bannerImage}
						alt=""
					/>
					:
					<div className="claim-box">
						<div className="claim-title">
							<div className="claim-title-content">
								<p>$WHEY</p>
								<h2>{rewardValue.toFixed(SHOW_REWARD_FIXED)}</h2>
							</div>
							<img
								src={coinsImage}
								alt=""
							/>
						</div>
						<p>Accumulated Rewards Amount</p>
						<ClaimButton disabled={loading} onClick={() => onClaim()}>
							{!loading ?
								<>
									Claim $WHEY
								</>
								:
								<SyncLoader color="#F3B82F" size={15} />
							}
						</ClaimButton>
					</div>
				}

			</div>
		</div>
	)
}