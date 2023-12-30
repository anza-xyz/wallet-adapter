import { WalletConnect } from '@/components/WalletConnect'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.walletConnectContainer}>
        <WalletConnect />
      </div>
    </main>
  )
}
