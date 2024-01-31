import React from 'react'

function ClaimedLink({link}) {
  return (
    <a href={"https://explorer.solana.com/tx/" + link + "?cluster=devnet"} target="blank">{link.slice(0,8)}...</a>
  )
}

export default ClaimedLink